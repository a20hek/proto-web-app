import { Center, Circle, Divider, Image } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import Timeline from '../components/Timeline';
import axios from 'axios';
import { useWallet } from '@solana/wallet-adapter-react';
import { Orbis } from '@orbisclub/orbis-sdk';
import dateFormat from 'dateformat';

let orbis = new Orbis();

export default function Lifelog() {
	const [feedData, setFeedData] = useState<any>();
	const { publicKey } = useWallet();

	useEffect(() => {
		async function getPosts() {
			let isConnectedtoOrbis = await orbis.isConnected();
			console.log(isConnectedtoOrbis);
			if (!isConnectedtoOrbis) {
				await orbis.connect_v2({
					provider: window?.phantom?.solana,
					chain: 'solana',
				});
			} else {
				const { data, error } = await orbis.getPosts({ tag: 'proto' });
				console.log(data);
				setFeedData(data);
			}
		}

		if (publicKey) getPosts();
	}, [publicKey]);

	const FeedCard = ({ body, tag, username, lat, long, date, files, pfp }) => {
		const dateTime = dateFormat(date, 'dd mmmm yyyy, HH:MM:ss');
		const url = files[0]?.url.replace('ipfs://', 'https://ipfs.io/ipfs/');
		const tagIcon = tag?.charAt(0);
		return (
			<div className='px-2 py-4 m-2 '>
				<div className='flex items-center justify-between'>
					<div className='mx-6'>
						<div className='flex align-middle items-center '>
							<Image
								src={pfp}
								alt='pfp'
								className=' rounded-full object-cover h-8 w-8 cursor-pointer border border-[#b6b8b9] mr-2'
							/>
							<p className='text-black py-2'>{username}</p>
						</div>
						<p className=' font-medium text-primary py-1 text-lg'>{body}</p>
						{tag && (
							<Circle bg='primary' p={1} size='18px'>
								<p className='font-bold text-white'>{tagIcon}</p>
							</Circle>
						)}
						<p className='text-gray-700 text-sm py-2'>
							{lat},{long}
						</p>
						{/* <p>{dateTime}</p> */}
					</div>
					<div className='mx-6'>
						{files?.length > 0 && <Image src={url} className='h-16 w-16' />}
					</div>
				</div>
				{/* <Divider color='gray.500' /> */}
			</div>
		);
	};

	return (
		<div className='mb-24'>
			<div>
				<Center>
					<div className='divide-y divide-gray-300'>
						{feedData?.map((data, index) => (
							<FeedCard
								key={index}
								body={data.content.body}
								files={data.content.files}
								lat={data.content.data.latitude}
								long={data.content.data.longitude}
								tag={data.content.tags[1]?.title}
								username={data?.creator_details?.profile?.username}
								pfp={data?.creator_details?.profile?.pfp}
								date={data.timestamp}
							/>
						))}
					</div>
				</Center>
			</div>
		</div>
	);
}
