import React, { useState } from "react";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
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
    socials: ["google", "x", "github"],
    showWallets: true, // default to true
    walletFeatures: true, // default to true
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


const ListProducts = () => {

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    category: "",
    price: "",
    currency: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
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
    console.log("hey");
    try {
      let priceInWei;
      if (formData.currency === "0x323e78f944A9a1FcF3a10efcC5319DBb0bB6e673") {
        // USDT has 6 decimals
        priceInWei = ethers.parseUnits(formData.price.toString(), 6);
      } else {
        // DAI has 18 decimals
        priceInWei = ethers.parseUnits(formData.price.toString(), 18);
      }

      console.log(formData);

      const tx = await commerceContract.listProduct(
        formData.name,
        formData.description,
        formData.image,
        formData.category,
        priceInWei,
        formData.currency
      );

      console.log(priceInWei);

      await tx.wait();
      alert("Product listed successfully");
      navigate("/marketplace");
    } catch (error) {
      console.log("Error listing product:", error);
    }
  };
  return (
    <>
      <div>
        <div className="navbar bg-base-100">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">Croak 🐸</a>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <w3m-button />
            </ul>
          </div>
        </div>
      </div>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6">List Your Product</h2>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            >
              <option value="" disabled>
                Select Category
              </option>
              <option value="art">Art</option>
              <option value="nft">NFT</option>
              <option value="meme">Meme</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Price
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            >
              <option value="" disabled>
                Select Currency
              </option>
              <option value={CROAKAddress}>CROAK</option>
              <option value={DAIAddress}>DAI</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none"
            >
              List Product
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ListProducts;
