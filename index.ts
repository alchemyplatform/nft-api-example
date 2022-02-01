import {
  AssetResponse,
  AssetRow,
  AxiosAssetResponse,
  AxiosCollectionResponse,
  CollectionResponse,
  SpannerLogRow,
  SpannerNonNullStringElem,
} from "./types";
import { axiosClient } from "./axiosClient";
import { Spanner } from "@google-cloud/spanner";
import { parse } from "path/posix";

// Replace with your alchemy api key
const ALCHEMY_API_KEY = "demo";
const SPANNER_PROJECT_ID = "dulcet-hulling-318401";
const SPANNER_INSTANCE_ID = "druid-killer-v1";
export const SPANNER_QUERY_TIMEOUT = 10000;

// https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/getnfts
const getNFTsForOwnerEndpoint = `https://eth-mainnet.g.alchemy.com/${ALCHEMY_API_KEY}/v1/getNFTs/`;
// https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/getnftmetadata
const getNFTsForOwnerByCollectionEndpoint = `https://eth-mainnet.g.alchemy.com/${ALCHEMY_API_KEY}/v1/getNFTsForOwnerByCollection/`;

let spanner: Spanner | null = null;

function getSpannerDb(): any {
  if (!spanner) {
    spanner = new Spanner({
      projectId: SPANNER_PROJECT_ID,
    });
  }
  const instance: any = spanner.instance(SPANNER_INSTANCE_ID);
  const database: any = instance.database("blockchain_nftassets");
  return database;
}

export const defaultOptions = {
  gaxOptions: {
    timeout: SPANNER_QUERY_TIMEOUT,
    retryRequestOptions: {
      noResponseRetries: 1,
    },
  },
};

/*
 * Fetches paginated list of NFT's owned by the given address.
 *
 * You can use this function to display all of the user's NFTs
 * in a list view. For example you might have the user connect
 * their wallet via metamask and then direct them to a page where
 * they can see all their NFTs. All you have to do is put the
 * user's wallet address into this function and you will get back
 * an array of NFTs that you can render. Each NFT will have an
 * image uri that you can render along with the title of the NFT.
 */
async function getNFTsForOwner(
  ownerAddress: string,
  pageKey: string | null = null
): Promise<AssetResponse> {
  let getUrl = `${getNFTsForOwnerEndpoint}?owner=${ownerAddress}&withMetadata=false`;
  if (pageKey) {
    getUrl = `${getUrl}&pageKey=${pageKey}`;
  }

  const response: AxiosAssetResponse = await axiosClient.get(getUrl);
  return response.data;
}

/*
 * Fetches paginated list of NFT's owned by the given address only
 * for the given collection.
 *
 * This function is practically the same as getNFTsForOwner
 * but allows you to only fetch NFTs for the user that belong
 * to a particular collection. For instance if you have rendered
 * the NFTs from getNFTsForOwner and allowed the user to tap
 * into the collection, then you may want to only render NFTs
 * for that particular collection for the user.
 */
async function getNFTsForOwnerFilteredByCollection(
  ownerAddress: string,
  contractAddress: string,
  pageKey: string | null = null
): Promise<AssetResponse> {
  let getUrl = `${getNFTsForOwnerEndpoint}?owner=${ownerAddress}&contractAddresses%5B%5D=${contractAddress}&withMetadata=true`;
  if (pageKey) {
    getUrl = `${getUrl}&pageKey=${pageKey}`;
  }

  const response: AxiosAssetResponse = await axiosClient.get(getUrl);
  return response.data;
}

/*
 * Fetches NFT's owned by the given address and grouped by collection.
 *
 * This endpoint allows you to display the user's NFTs organized by
 * collection rather than as a flat list of images. The response will
 * be a list of collections and inside those collections will be a
 * list of NFTs that the user owns for that collection.
 */
async function getCollectionsForOwner(
  ownerAddress: string,
  maxNFTsPerContract: number = 10
): Promise<CollectionResponse> {
  const response: AxiosCollectionResponse = await axiosClient.get(
    `${getNFTsForOwnerByCollectionEndpoint}?owner=${ownerAddress}&maxNFTsPerContract=${maxNFTsPerContract}`
  );
  return response.data;
}

export function parseSpannerString(elem: SpannerNonNullStringElem): string {
  return elem.value;
}

function spannerRowToAssetRow(log: SpannerLogRow): string {
  return parseSpannerString(log[1]) + "|" + parseSpannerString(log[2]);
}

export async function getOwnersTokensFromSpanner(
  owner: string
): Promise<string[]> {
  const sql = `
		SELECT *
		FROM eth_nftOwners
		WHERE owner_address='${owner}';
	`;
  const logs: SpannerLogRow[] = await getSpannerDb().run({
    ...defaultOptions,
    sql,
  });
  return logs[0].map((log) => spannerRowToAssetRow(log));
}

async function runExamples(): Promise<void> {
  let owners: string[] = [
    "0xf7f79aef7ef0781191fd6cf37c1d06bc172a38cf",
    "0xb2c5ae080a236fe89a87fdbd1f9d58ad4b57c6b2",
    "0xa9f9c0eac673e215e7f18b38531b24c6b8edf861",
    "0xb0151d256ee16d847f080691c3529f316b2d54b3",
    "0x17b947811336764c0f0ae77011772a2acd5bba6b",
    "0x3fe61420c33b0e41ddd763adaaeb0b638e78b768",
    "0x05f2fe99ea69ecafd6ad2cddc02f154a97413b5d",
    "0x68d4ab83883d3636bf3c2dd79dd8ca4535e09f36",
    "0x12ac0f22aab239db438bc575266e62d033388da8",
  ];

  // Query getNFTs endpoint
  for (let i = 0; i < owners.length; i++) {
    const firstPage = await getNFTsForOwner(owners[i]);
    let tokens: string[] = [];
    firstPage.ownedNfts.forEach((nft) => {
      tokens.push(nft.contract.address + "|" + nft.id.tokenId);
    });
    let pageKey = firstPage.pageKey;
    while (pageKey) {
      const nextPage = await getNFTsForOwner(owners[i], pageKey);
      nextPage.ownedNfts.forEach((nft) => {
        tokens.push(nft.contract.address + "|" + nft.id.tokenId);
      });
      pageKey = nextPage.pageKey;
    }

    // Query spanner
    const rows: string[] = await getOwnersTokensFromSpanner(owners[i]);
    console.log(
      "Owner " +
        owners[i] +
        " nftApiCount " +
        tokens.length +
        " spannerCount " +
        rows.length
    );
    let intersection = tokens.filter((x) => rows.includes(x));
    if (
      intersection.length == tokens.length &&
      intersection.length == rows.length
    ) {
      console.log("Same");
    } else {
      console.log("Different");
      let diffFound = false;
      let difference = tokens.filter((x) => !rows.includes(x));
      if (difference.length != 0) {
        console.log("NFT API has " + difference);
        diffFound = true;
      }
      difference = rows.filter((x) => !tokens.includes(x));
      if (difference.length != 0) {
        console.log("Spanner has " + difference);
        diffFound = true;
      }
    }
  }
  console.log();
  //console.log(JSON.stringify(firstPage.ownedNfts[0]));
  /*
  const testOwnerAddress = "0x04f5df957ce0405ba0264eca6130161cfaa12571";
  const testContractAddress = "0x60e4d786628fea6478f785a6d7e704777c86a7c6";

  const firstPage = await getNFTsForOwner(testOwnerAddress);
  console.log("\nFirst NFT for first page of getNFTsForOwner");
  console.log(JSON.stringify(firstPage.ownedNfts[0]));

  const secondPage = await getNFTsForOwner(testOwnerAddress, firstPage.pageKey);
  console.log("\nFirst NFT for second page of getNFTsForOwner");
  console.log(JSON.stringify(secondPage.ownedNfts[0]));

  const firstFilteredPage = await getNFTsForOwnerFilteredByCollection(
    testOwnerAddress,
    testContractAddress
  );
  console.log("\nFirst NFT for getNFTsForOwnerFilteredByCollection");
  console.log(JSON.stringify(firstFilteredPage.ownedNfts[0]));

  const collectionResponse = await getCollectionsForOwner(testOwnerAddress);
  console.log("\nFirst collection for getCollectionsForOwner");
  console.log(JSON.stringify(collectionResponse.collections[0]));*/
}

if (require.main === module) {
  runExamples();
}
