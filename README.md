### Overview

This repo demonstrates three ways to use the Alchemy NFT api.

### Fetch all the NFTs that belong to an address.

Fetches a paginated list of NFT's owned by the given address. You can use this function to display all of the user's NFTs in a list view. For example you might have the user connect their wallet via metamask and then direct them to a page where they can see all their NFTs. All you have to do is put the user's wallet address into this function and you will get back an array of NFTs that you can render. Each NFT will have an image uri that you can render along with the title of the NFT.

Example display

<center><img src="https://user-images.githubusercontent.com/5247707/150714145-30642204-e7ea-47cb-a2e1-ec3616250bc9.png" alt="drawing" width="200"/></center>

Usage

```javascript
const ownerAddress = "0x04f5df957ce0405ba0264eca6130161cfaa12571";

const response = await getNFTsForOwner(ownerAddress);
console.log(firstPage.ownedNfts);
```

### Fetch all the NFTs that belong to an address filtered by a particular contract/collection.

Fetches paginated list of NFT's owned by the given address only for the given collection. This function is practically the same as getNFTsForOwner but allows you to only fetch NFTs for the user that belong to a particular collection. For instance if you have rendered the NFTs from getNFTsForOwner and allowed the user to tap into the collection, then you may want to only render NFTs for that particular collection for the user.

Example display

<center><img src="https://user-images.githubusercontent.com/5247707/150714183-c887090e-b242-44cc-9f49-3e487790fd74.png" alt="drawing" width="200"/></center>

Usage

```javascript
const ownerAddress = "0x04f5df957ce0405ba0264eca6130161cfaa12571";
const contractAddress = "0x60e4d786628fea6478f785a6d7e704777c86a7c6";

const response = await getNFTsForOwner(
	ownerAddress,
	contractAddress,
);
console.log(response.ownedNfts);
```

### Fetch all collections for which an address owns an NFT.

Fetches NFT's owned by the given address and grouped by collection. This endpoint allows you to display the user's NFTs organized by collection rather than as a flat list of images. The response will be a list of collections and inside those collections will be a list of NFTs that the user owns for that collection.

Example display

<center><img src="https://user-images.githubusercontent.com/5247707/150714225-44b5b81a-529d-4d10-b775-e84ff6176336.png" alt="drawing" width="200"/></center>

Usage

```javascript
const ownerAddress = "0x04f5df957ce0405ba0264eca6130161cfaa12571";

const response = await getCollectionsForOwner(ownerAddress);
console.log(response.collections);
```

### Documentation

You can find additional Alchemy documentation for these methods here https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/getnfts.

### Install dependencies

```bash
yarn
```

### See all three methods in action

```bash
yarn dev
```
