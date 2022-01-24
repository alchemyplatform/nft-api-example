import {
  AssetResponse,
  AxiosAssetResponse,
  AxiosCollectionResponse,
  CollectionResponse,
} from "./types";
import { axiosClient } from "./axiosClient";

// Replace with your alchemy api key
const ALCHEMY_API_KEY = "demo";

// https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/getnfts
const getNFTsForOwnerEndpoint = `https://eth-mainnet.g.alchemy.com/${ALCHEMY_API_KEY}/v1/getNFTs/`;
// https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/getnftmetadata
const getNFTsForOwnerByCollectionEndpoint = `https://eth-mainnet.g.alchemy.com/${ALCHEMY_API_KEY}/v1/getNFTsForOwnerByCollection/`;

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
  let getUrl = `${getNFTsForOwnerEndpoint}?owner=${ownerAddress}&withMetadata=true`;
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

async function runExamples(): Promise<void> {
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
  console.log(JSON.stringify(collectionResponse.collections[0]));
}

if (require.main === module) {
  runExamples();
}
