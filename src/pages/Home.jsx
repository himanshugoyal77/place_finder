import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/clerk-react";
import React, { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { firestore, doc, getDoc, setDoc } from "../firebase";

import { OrbitControls } from "@react-three/drei";
import { Model } from "../Earth";
import Navbar from "../components/Navbar";
import SearchIcon from "../icons/SearchIcon";
import upload from "../utils/upload";
import { Toaster, toast } from "react-hot-toast";
import TravelForm from "./TravelForm";

import { FaMicrophone, FaPause } from "react-icons/fa";
import StarCanvas from "../components/Starbackground";
import { Canvas } from "@react-three/fiber";

const Home = () => {
  const navigate = useNavigate();
  const [utterance, setUtterance] = useState(null);
  const [destination, setDestination] = React.useState(null);
  const [imageUrl, setImageUrl] = React.useState([]);

  const handleFile1 = async (e) => {
    e.preventDefault();

    const files = e.target?.files;
    if (files?.length > 0) {
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }
      data.append("upload_preset", "fiverr");
      const url = await upload(data);
      setImageUrl([...imageUrl, url]);
      console.log("url", url);
    }
    toast.success("File Uploaded");
  };

  console.log("imageUrl", imageUrl);

  const getPredictions = async (e) => {
    e.preventDefault();
    if (imageUrl.length === 0 && !destination) {
      toast.error("Please upload an image first!");
      return;
    }
    if (destination)
      return navigate(`/destination/${destination}`, {
        state: { location_name: destination },
      });

    const data = {
      image_url: imageUrl[0],
    };
    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    setDestination(result.prediction);
    navigate(`/destination/${result.prediction}`, {
      state: { location_name: result.prediction },
    });
  };

  console.log("destination", destination);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognition = new window.webkitSpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    // setIsListening(true);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error detected: ", event.error);
    // setIsListening(false);
  };

  recognition.onend = () => {
    // setIsListening(false);
  };

  recognition.onresult = (event) => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        setDestination(transcript);
      } else {
        interimTranscript += transcript;
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  return (
    <div className="relative bg-[#0004] h-screen w-full overflow-x-hidden">
      <button className="absolute right-6 top-6 z-30 btn px-12 bg-slate-300 rounded-md">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <SignOutButton />
        </SignedIn>
      </button>
      <Toaster />
      <div className="h-screen w-full bg-black">
        <StarCanvas />
      </div>
      <div
        className="w-max absolute z-30
      left-1/2 right-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0004] rounded-md
      text-white p-8 shadow-2xl flex flex-col items-center justify-center"
      >
        <h1 className="font-extrabold text-6xl prevent-select text-[#76ABAE]">
          Want To Plan A Trip?
        </h1>
        <p className="text-3xl prevent-select font-bold tracking-wider text-[#434955] mt-6 pl-1">
          we are here to help
        </p>
        <p className="mt-2 text-xl text-center prevent-select text-[#434955] tracking-wide pl-1">
          Plan your next unforgettable trip effortlessly and <br /> start making
          memories that last a lifetime
        </p>
        <label className="block prevent-select mt-8 relative w-full justify-center border py-2 px-2 rounded-md gap-2 shadow-2xl focus-within:border-gray-300 flex">
          <input
            onChange={(e) => setDestination(e.target.value)}
            id="search-bar"
            value={destination}
            placeholder="Enter your destination"
            className="px-2 py-1 w-full rounded-md text-white outline-none bg-transparent"
          />
          <button
            onClick={toggleListening}
            className="flex items-center justify-center text-white"
          >
            {isListening ? <FaPause /> : <FaMicrophone />}
          </button>
          <p>{text}</p>
        </label>

        <div className="flex items-center justify-center w-full my-4">
          <hr className="w-28 opacity-45" />
          <p className="text-[#434955] font-bold text-sm tracking-wider mx-4">
            or
          </p>
          <hr className="w-28 opacity-45" />
        </div>

        <label
          class="block prevent-select relative w-fulljustify-center border py-2 px-2 rounded-md gap-2 shadow-2xl focus-within:border-gray-300"
          for="search-bar"
        >
          <input
            onChange={handleFile1}
            type="file"
            placeholder="enter your destination"
            class="w-full rounded-md text-white outline-none bg-transparent"
          />
        </label>

        <button
          onClick={getPredictions}
          className="btn w-56 mt-8 text-black font-bold flex items-center justify-center gap-3"
        >
          <SearchIcon />
          Get Started
        </button>
        {/* Open the modal using document.getElementById('ID').showModal() method */}
      </div>

      <div className="absolute z-10 top-0 h-full w-full">
        <Canvas shadows camera={{ position: [30, 120, -30] }}>
          <OrbitControls
            enableDamping
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
            autoRotate={true}
            autoRotateSpeed={1.2}
            onPointerEnter={() => (document.body.style.cursor = "grab")}
            onPointerLeave={() => (document.body.style.cursor = "auto")}
          />
          <Suspense fallback={null}>
            <Model />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

export default Home;
