import {
  Button,
  Center,
  Circle,
  Heading,
  useDisclosure,
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import Link from 'next/link';
import React, { useState, useEffect, Suspense, useContext } from 'react';
import Loading from '../components/Loading';
import { FailedCheckInIcon, SuccessCheckInIcon } from '../dynamic/CheckInIcons';

interface Region {
  continents: number;
  countries: number;
  cities: number;
}

interface Places {
  events: number;
  attractions: number;
  landmarks: number;
}

export default function Options() {
  const [regions, setRegions] = useState<Region | []>([]);
  const [places, setPlaces] = useState<Places | []>([]);
  const wallet = useWallet();
  const [checkInCount, setCheckInCount] = useState();

  useEffect(() => {
    async function getTimelineData() {
      try {
        const timelineResponse = await axios.get(
          'https://proto-api.onrender.com/checkins',
          {
            params: { user_wallet_address: wallet?.publicKey },
          }
        );
        setCheckInCount(timelineResponse.data.length);
        console.log(timelineResponse.data.length);
      } catch (err) {
        console.log(err);
      }
    }

    if (wallet?.publicKey) getTimelineData();
  }, [wallet?.publicKey]);

  return (
    <div className="mx-auto max-w-[800px]">
      {/* {tour && <Button onClick={tour.start}>Open Tour</Button>} */}
      <div className=" flex flex-col py-2 md:px-6">
        <div className="flex h-[200px]">
          <Link
            href="/"
            className='relative m-2 w-1/2 rounded-lg
                    border-2 border-primary
					bg-[#6fe0a8] bg-[url("/map-placeholder.png")] bg-cover bg-no-repeat'
          >
            {/* <Image src='/profileplaceholder.svg' alt='placeholder' fill /> */}
            <Heading
              fontSize="2xl"
              color="primary"
              className="absolute left-4 bottom-2"
            >
              Check-In Map
            </Heading>
          </Link>
          <div className="relative m-2 w-1/2 rounded-lg bg-[#DEAD2A]">
            {checkInCount && (
              <Center>
                <div className="mt-2 flex">
                  <div className="flex flex-col items-center">
                    <Heading fontSize="42px" color="#fff">
                      0
                    </Heading>
                    <SuccessCheckInIcon />
                  </div>
                  <Heading fontSize="42px" color="#fff" mx="8px">
                    /
                  </Heading>
                  <div className="flex flex-col items-center">
                    <Heading fontSize="42px" color="#fff">
                      {checkInCount}
                    </Heading>
                    <FailedCheckInIcon />
                  </div>
                </div>
              </Center>
            )}
            <Heading
              fontSize="2xl"
              color="#fff"
              className="absolute left-4 bottom-2"
            >
              Check-Ins
            </Heading>
          </div>
        </div>
        <div className="flex h-[200px]">
          <div className="relative m-2 w-1/2 rounded-lg bg-[#077191]">
            <Heading
              fontSize="2xl"
              color="#fff"
              className="absolute left-4 bottom-2"
              // ref={step1Ref}
            >
              Regions
            </Heading>
          </div>
          <div className="relative m-2 w-1/2 rounded-lg bg-[#0c747a]">
            <Heading
              fontSize="2xl"
              color="#fff"
              className="absolute left-4 bottom-2"
            >
              Places
            </Heading>
          </div>
        </div>
        {wallet.connected && (
          <>
            <div className="mt-6 p-2">
              <p className=" text-sm text-gray-500 ">Wallet Address</p>
              <p className="text-gray-600 ">{wallet.publicKey?.toBase58()}</p>
            </div>
            <div className="rounded-md bg-primary p-2 ">
              <p className="text-center  font-medium text-white ">Connected</p>
            </div>
            {/* <p className='text-center '>You're connected to proto via </p> */}
          </>
        )}
      </div>
    </div>
  );
}
