interface Contract {
  address: string;
}

interface Id {
  tokenId: string;
}

export interface Uri {
  raw: string;
  gateway: string;
}

interface Metadata {
  image: string;
}

interface Asset {
  contract: Contract;
  id: Id;
  title: string;
  description: string;
  tokenUri: Uri;
  media: Uri[];
  metadata: Metadata;
  timeLastUpdated: string;
}

export interface AssetResponse {
  ownedNfts: Asset[];
  totalCount: number;
  pageKey?: string;
}

export interface AxiosAssetResponse {
  data: AssetResponse;
}

interface Collection {
  contract: Contract;
  verified: boolean; // true if the contract is verified on OpenSea, false otherwise
  name?: string;
  nfts: Asset[];
}

export interface CollectionResponse {
  collections: Collection[];
}

export interface AxiosCollectionResponse {
  data: CollectionResponse;
}

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
