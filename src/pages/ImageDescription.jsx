import React, { useState, useEffect, useRef, useCallback } from "react";
import "./ImageDescription.css"; // Import CSS file
// import Carousel from '../components/Carousel';
import axios from "axios";
import CarouselDefault from "../components/Carousel";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import TravelForm from "./TravelForm";
import ChatBot from "./ChatBot";
import toast from "react-hot-toast";

import OpenAI from "openai";
import pineconeClient from "../utils/pinecone";
import { describeCollection } from "@pinecone-database/pinecone/dist/control";
// import 'dotenv/config';

const cache = {};

const images = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Icon-mode-bus-default.svg/2048px-Icon-mode-bus-default.svg.png",
  "https://cdn-icons-png.flaticon.com/512/3373/3373986.png",
  "https://cdn-icons-png.flaticon.com/512/7720/7720736.png",
];

const ImageDescription = () => {
  const location = useLocation();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const messageRef = useRef(null);
  const [data, setData] = useState([]);
  const inputRef = useRef(null);
  const [position, setPosition] = useState({ latitude: 0, longitude: 0 });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function (position) {
        setPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
    const getPhotos = async () => {
      try {
        const response = await axios.get(
          `https://api.unsplash.com/search/photos?query=${location.state.location_name}`,
          {
            headers: {
              Authorization: `Client-ID zt_FmhK9BOzskTqqzSmJEqAFdFQ4Z_Oz64GnxH-IGpg`,
            },
          }
        );
        setPhotos(response.data.results);
      } catch (error) {
        console.error("Error fetching photos:", error);
      }
    };

    getPhotos();
  }, []);

  useEffect(() => {
    const timerId = setTimeout(async () => await apiCall(), 3000);

    return () => clearInterval(timerId);
  }, []);

  const apiCall = useCallback(async () => {
    if (cache[location.state.location_name.toString()]) {
      setDescription(cache[location.state.location_name.toString()]);
      return;
    }

    const OPENAI_KEY = "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";

    const openai = await new OpenAI({
      apiKey: OPENAI_KEY,
      dangerouslyAllowBrowser: true,
    });

    const aiModel = "gpt-3.5-turbo";

    const messages = [
      {
        role: "system",
        content: `you are tourist giude. you know everything about popular places in India, you help people by sharing the detailed information of that places. your task is to give the detailed overview of ${location.state.location_name.toString()} with its history, near by popular places and best time visit there.
        the response should be in the following json format:
           {
            info:     {
              "history": "",
              "near_by_places": "",
              "best_time_to_visit": "",
              "nearby_hotels": "",
              "cost": "",
              "nearest_stations": ""          
            }
           }
        `,
      },
    ];

    const completions = await openai.chat.completions.create({
      model: aiModel,
      response_format: {
        type: "json_object",
      },
      messages,
    });

    const aiResponse = completions.choices[0].message.content;

    console.log("aiResponse", aiResponse);
    const json = JSON.parse(aiResponse);
    console.log("json", json);
    cache[location.state.location_name.toString()] = json.info;
    setDescription(json.info);
    setLoading(false);
    return json;
  }, []);

  console.log(typeof description, "description");
  return (
    <div className="bg-[#242424] h-full">
      <Navbar />
      <div className="flex flex-col mx-auto p-10 ">
        <div className="flex w-full gap-3 mt-8">
          {photos &&
            photos.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className="
              w-150 h-80 object-cover rounded-lg bg-slate-600
              "
              >
                <img
                  src={image.urls.raw}
                  alt={`${index}`}
                  className="object-cover h-80 w-150 rounded-lg"
                />
              </div>
            ))}
        </div>

        <div className="description-container mt-8">
          <h2 className="text-3xl font-bold text-orange-500 mb-4">
            {location.state.location_name.toString().toUpperCase()}
          </h2>
          {loading ? (
            <div className="flex flex-col gap-2 mb-4">
              <div className="skeleton h-20 w-full"></div>
              <div className="skeleton h-4 w-28"></div>
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-full"></div>
            </div>
          ) : (
            <>
              <p className="text-xl font-bold text-orange-600 mb-4">History</p>
              <p className="mb-4 text-white">{description?.history}</p>
              <hr />
              <p className="text-xl font-bold text-orange-600 mb-4">
                Best time to visit
              </p>
              <p className="mb-4 text-white">
                {description?.best_time_to_visit}
              </p>
              <hr />
              <h5 className="text-xl font-bold text-orange-600 mb-4">
                Expenses
              </h5>
              <p className="mb-4 text-white">{description?.cost}</p>
              {/* <p className="mb-4 text-white">{description.split("\n\n")[1]}</p> */}
            </>
          )}
          <div className="grid grid-cols-2 w-2/3  mx-auto gap-4 my-10">
            {description &&
              description.nearest_stations
                .split(".")
                .slice(0, description.nearest_stations.split(".").length - 1)
                .map((info) => {
                  if (info.includes("railway")) {
                    return (
                      <div className="flex gap-3 w-full bg-slate-200 items-center justify-start rounded-md p-4 shadow-sm">
                        <img
                          className="h-12 w-12  rounded-full"
                          src={images[1]}
                          alt=""
                        />
                        <div className="flex flex-col">{info}</div>
                      </div>
                    );
                  } else if (info.includes("airport")) {
                    return (
                      <div className="flex gap-3 w-full bg-slate-200 items-center justify-start rounded-md p-4 shadow-sm">
                        <img
                          className="h-14 w-14  rounded-full"
                          src={images[2]}
                          alt=""
                        />
                        <div className="flex flex-col">{info}</div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex gap-3 w-full bg-slate-200 items-center justify-start rounded-md p-4 shadow-sm">
                        <img
                          className="h-14 w-14  rounded-full"
                          src={images[0]}
                          alt=""
                        />
                        <div className="flex flex-col">{info}</div>
                      </div>
                    );
                  }
                })}
          </div>

          {/* <button className="btn">
            <a href="https://65d48357fe477cbd8289b506--stellar-flan-1e2dae.netlify.app/">
              View on Interactive Mode
            </a>
          </button> */}
          {/* <div className="w-full h-screen">
            <iframe
              className="w-full h-full border-none no-scrollbar"
              src="https://65d48357fe477cbd8289b506--stellar-flan-1e2dae.netlify.app/"
              title="description"
            ></iframe>
          </div> */}

          <dialog id="my_modal_5" className="modal">
            <div
              ref={messageRef}
              className="modal-box bg-[#000004] h-2/3 no-scrollbar flex flex-col items-center"
            >
              <form method="dialog" className="ml-1/2">
                <h1 className="mb-6 mt-3 font-bold text-white text-center mx-auto">
                  Ask question related to this Location
                </h1>
                <button className="btn text-white btn-lg btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>
              <ChatBot
                data={
                  description.info +
                  " " +
                  description.best_time_to_visit +
                  " " +
                  description.nearby_hotels +
                  " " +
                  description.cost +
                  " " +
                  description.nearest_stations
                }
                place={location.state.location_name.toString()}
              />
            </div>
          </dialog>
        </div>
      </div>
    </div>
  );
};

export default ImageDescription;
