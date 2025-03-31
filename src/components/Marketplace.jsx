import React, { useEffect, useState } from "react";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import { Link } from "react-router-dom";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract, ethers, parseUnits } from "ethers";
import { useNavigate } from "react-router-dom";
import { commerceABI } from "../commerceABI";

const commerceContractAddress = "0x501F1ABBFae1f7382cfA54871685eB1E8A845fb6";



// 1. Get projectId
const projectId = "54c238d52f1218087ae00073282addb8";

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};
const sepolia = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io",
  rpcUrl:
    "https://eth-sepolia.g.alchemy.com/v2/_O9yEvZei4_BPgQbLawL754cAfubB8jr", // Replace with your Infura project ID
};
const lineasepolia = {
  chainId: 59141,
  name: "LineaSepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.lineascan.build",
  rpcUrl:
    "https://linea-sepolia.g.alchemy.com/v2/_O9yEvZei4_BPgQbLawL754cAfubB8jr", // Replace with your Infura project ID
};

// 3. Create a metadata object
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,
 auth: {
      email: true, // default to true
      socials: ['google', 'x', 'github'],
      showWallets: true, // default to true
      walletFeatures: true // default to true
    },
  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: "...", // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
});

// 5. Create a AppKit instance
createWeb3Modal({
  ethersConfig,
  chains: [mainnet, sepolia, lineasepolia],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});


const CROAKAddress = "0x4309Eb90A37cfD0ecE450305B24a2DE68b73f312";
const DAIAddress = "0xC817c2C63178877069107873489ea69819f1A537";


const currencyDetails = {
  "0x4309Eb90A37cfD0ecE450305B24a2DE68b73f312": { name: "CROAK", decimals: 18 },
  "0xC817c2C63178877069107873489ea69819f1A537": { name: "DAI", decimals: 18 },
};

const ERC20ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
];


const currencyMapping = {
  [CROAKAddress]: "CROAK",
  [DAIAddress]: "DAI",
};


const Marketplace = () => {
const { address, chainId, isConnected } = useWeb3ModalAccount();
const { walletProvider } = useWeb3ModalProvider();
const [products, setProducts] = useState([]);
const navigate = useNavigate();

useEffect(() => {
    if (!walletProvider) return;
 const loadProducts = async () => {
   const ethersProvider = new BrowserProvider(walletProvider);
   const signer = await ethersProvider.getSigner();
   const commerceContract = new Contract(
     commerceContractAddress,
     commerceABI,
     signer
   );

   const productCount = await commerceContract.productCount();

   const loadedProducts = [];
   for (let i = 1; i <= productCount; i++) {
     const product = await commerceContract.products(i);
     if (!product.purchased) {
       loadedProducts.push(product);
     }
   }
   setProducts(loadedProducts);
 };

 loadProducts();
}, [walletProvider]);


const formatPrice = (price, curr) => {
  const details = currencyDetails[curr];
  if (!details) return "Unknown Currency";

  const formattedPrice = ethers.formatUnits(price, details.decimals);
  return formattedPrice;
};

 const handlePurchase = async (id, price, currency) => {
   if (!walletProvider) {
     alert("User not connected");
     return;
   }

   const ethersProvider = new BrowserProvider(walletProvider);
   const signer = await ethersProvider.getSigner();
   const commerceContract = new Contract(
     commerceContractAddress,
     commerceABI,
     signer
   );

	try {
		 //Handle ERC20 purchase (USDT/DAI)
		let adjustedPrice;
		  // DAI (18 decimals)
		  if (currency !== CROAKAddress) {
		  adjustedPrice = ethers.parseUnits(price.toString(), 18);
		  const ERC20Contract = new Contract(currency, ERC20ABI, signer);
		  const approveTx = await ERC20Contract.approve(
			commerceContractAddress,
			adjustedPrice
		  );
		  await approveTx.wait();

		  const purchaseTx = await commerceContract.purchaseProduct(id);
		  await purchaseTx.wait();
		}        
		//Handle CROAK purchase
		else {
		  const adjustedPrice = ethers.parseUnits(price.toString(), 18);
      const ERC20Contract = new Contract(currency, ERC20ABI, signer);
		  const approveTx = await ERC20Contract.approve(
			commerceContractAddress,
			adjustedPrice
		  );
		  await approveTx.wait();
		  const purchaseTx = await commerceContract.purchaseProduct(id);
		  await purchaseTx.wait();
		}
      alert("Product purchased successfully");
      navigate("/my"); // Navigate to user's purchases page or refresh the marketplace
	} catch(error){
		console.log(error);
	};
      
    } 

  return (
    <>
      <div>
        <div className="navbar bg-base-100">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">Croak 🐸</a>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Link to="/list">List Products</Link>
              </li>
              <li>
                <Link to="/my">My Products</Link>
              </li>
              <w3m-button />
            </ul>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">Marketplace</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="max-w-sm rounded overflow-hidden shadow-lg bg-white"
            >
              <img className="w-full" src={product.image} alt={product.name} />
              <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">
                  {product.name.toUpperCase()}
                </div>
                <p className="text-gray-700 text-base">{product.description}</p>
                <p className="text-gray-900 font-bold">
                  {formatPrice(product.price, product.currency)}{" "}
                  {currencyMapping[product.currency] || "Unknown Currency"}
                </p>
                <p className="text-gray-900 font-bold">
                  {product.category.toUpperCase()}
                </p>
                <button
                  onClick={() =>
                    handlePurchase(product.id, product.price, product.currency)
                  }
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Marketplace;
