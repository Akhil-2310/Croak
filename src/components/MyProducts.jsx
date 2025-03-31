import React, {useState, useEffect} from "react";
import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { Link } from "react-router-dom";
import { commerceABI } from "../commerceABI";

const commerceContractAddress = "0x501F1ABBFae1f7382cfA54871685eB1E8A845fb6";


const currencyDetails = {
  "0x4309Eb90A37cfD0ecE450305B24a2DE68b73f312": { name: "CROAK", decimals: 18 },
  "0xC817c2C63178877069107873489ea69819f1A537": { name: "DAI", decimals: 18 },
};


const CROAKAddress = "0x4309Eb90A37cfD0ecE450305B24a2DE68b73f312";
const DAIAddress = "0xC817c2C63178877069107873489ea69819f1A537";


const MyProducts = () => {

  const currencyMapping = {
    [CROAKAddress]: "CROAK",
    [DAIAddress]: "DAI",
  };

   const { walletProvider } = useWeb3ModalProvider();
   const [purchasedProducts, setPurchasedProducts] = useState([]);

   useEffect(() => {
     if (!walletProvider) return;

     const loadPurchasedProducts = async () => {
       const ethersProvider = new BrowserProvider(walletProvider);
       const signer = await ethersProvider.getSigner();
       const commerceContract = new Contract(
         commerceContractAddress,
         commerceABI,
         signer
       );

       const productIds = await commerceContract.getPurchasedProducts();
       const loadedProducts = [];

       for (let id of productIds) {
         const product = await commerceContract.getProduct(id);
         loadedProducts.push(product);
       }
       setPurchasedProducts(loadedProducts);
     };

     loadPurchasedProducts();
   }, [walletProvider]);


   const formatPrice = (price, curr) => {
     const details = currencyDetails[curr];
     if (!details) return "Unknown Currency";

     const formattedPrice = ethers.formatUnits(price, details.decimals);
     return formattedPrice;
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
              <li>
                <Link to="/list">List Products</Link>
              </li>
              <li>
                <Link to="/marketplace">Marketplace</Link>
              </li>
              <w3m-button />
            </ul>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">My Products</h2>
        {purchasedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedProducts.map((product) => (
              <div
                key={product.id}
                className="max-w-sm rounded overflow-hidden shadow-lg bg-white"
              >
                <img
                  className="w-full"
                  src={product.image}
                  alt={product.name}
                />
                <div className="px-6 py-4">
                  <div className="font-bold text-xl mb-2">{product.name}</div>
                  <p className="text-gray-700 text-base">
                    {product.description}
                  </p>
                  <p className="text-gray-900 font-bold">
                    {formatPrice(product.price, product.currency)}{" "}
                    {currencyMapping[product.currency] || "Unknown Currency"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No products purchased yet.</p>
        )}
      </div>
    </>
  );
};

export default MyProducts;
