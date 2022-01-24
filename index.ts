const http = require("http");
const axios = require("axios");

// Replace with your alchemy api key
const ALCHEMY_API_KEY = "demo";

// https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/getnfts
const getNFTsForOwnerEndpoint = `https://eth-mainnet.g.alchemy.com/${ALCHEMY_API_KEY}/v1/getNFTs/`;
// https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/getnftmetadata
const getNFTsForOwnerByCollectionEndpoint = `https://eth-mainnet.g.alchemy.com/${ALCHEMY_API_KEY}/v1/getNFTsByCollection/`;

const axiosClient = axios.create({
  timeout: 10000,
  httpAgent: new http.Agent({ keepAlive: true }),
});

/*
Example asset (NFT)

{
  "contract":{
    "address":"0x60e4d786628fea6478f785a6d7e704777c86a7c6"
  },
  "id":{
    "tokenId":"0x00000000000000000000000000000000000000000000000000000000000029c6",
  },
  "title":"",
  "description":"",
  "externalDomainViewUrl":"https://boredapeyachtclub.com/api/mutants/10694",
  "media":{
    "uri":"ipfs://QmaiJ4sVVqBH4fbG6wYTsGXzGyvRTmnZauf68d4ygFuELF"
  },
  "alternateMedia":[
    {
      "uri":"https://ipfs.io/ipfs/QmaiJ4sVVqBH4fbG6wYTsGXzGyvRTmnZauf68d4ygFuELF"
    }
  ],
  "metadata":{
    "image":"ipfs://QmaiJ4sVVqBH4fbG6wYTsGXzGyvRTmnZauf68d4ygFuELF"
  },
  "timeLastUpdated":"2022-01-23T23:59:55.919Z"
}
*/

interface Contract {
  address: string;
  verified: boolean;
}

interface Id {
  tokenId: string;
}

interface Media {
  uri: string;
}

interface Metadata {
  image: string;
}

interface Asset {
  contract: Contract;
  id: Id;
  title: string;
  description: string;
  externalDomainViewUrl: string;
  media: Media;
  alternateMedia: Media[];
  metadata: Metadata;
  timeLastUpdated: string;
}

interface AssetResponse {
  ownedNfts: Asset[];
  totalCount: number;
  pageKey?: string;
}

interface Collection {
  contract: Contract;
  assets: Asset[];
}

interface CollectionResponse {
  collections: Collection[];
}

/*
 *  Fetches paginated list of NFT's owned by the given address.
 */
async function getNFTsForOwner(
  ownerAddress: string,
  pageKey: string | null = null
): Promise<AssetResponse> {
  let getUrl = `${getNFTsForOwnerEndpoint}?owner=${ownerAddress}&withMetadata=true`;
  if (pageKey) {
    getUrl = `${getUrl}&pageKey=${pageKey}`;
  }

  const response = await axiosClient.get(getUrl);
  return response.data;
}

/*
 *  Fetches paginated list of NFT's owned by the given address only for the given collection.
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

  const response = await axiosClient.get(getUrl);
  return response.data;
}

/*
 *  Fetches NFT's owned by the given address and grouped by collection/contract.
 *  Note that this API is not paginated.
 */
async function getCollectionsForOwner(
  ownerAddress: string,
  maxNFTsPerContract: number = 10
): Promise<CollectionResponse> {
  const response = axiosClient.get(
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

  const firstFilteredPage = await getNFTsForOwnerFilteredByCollection(testOwnerAddress, testContractAddress);
  console.log("\nFirst NFT for getNFTsForOwnerFilteredByCollection");
  console.log(JSON.stringify(firstFilteredPage.ownedNfts[0]));

  const collectionResponse = await getCollectionsForOwner(testOwnerAddress);
  console.log("\nFirst collection for getCollectionsForOwner");
  console.log(JSON.stringify(collectionResponse.collections[0]));
}

if (require.main === module) {
  runExamples();
}
