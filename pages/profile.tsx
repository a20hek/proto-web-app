import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
	Button,
	Center,
	FormControl,
	FormHelperText,
	FormLabel,
	Input,
	InputGroup,
	InputRightElement,
	Image as ChakraImage,
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { DiscordLogo, InstagramLogo, TwitterLogo } from '../dynamic/Profile';
import axios from 'axios';
import Options from '../components/Options';
import { create } from 'ipfs-http-client';

import { Orbis } from '@orbisclub/orbis-sdk';

let orbis = new Orbis();

const projectId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET;

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = create({
	host: 'ipfs.infura.io',
	port: 5001,
	protocol: 'https',
	headers: {
		authorization: auth,
	},
});

export default function Profile() {
	const wallet = useWallet();
	const [userName, setUserName] = useState<string>(null);
	const [profilePic, setProfilePic] = useState<any>(null);
	const [editingUserName, setEditingUserName] = useState<boolean>(false);
	const [newUserName, setNewUserName] = useState<string>(null);
	const [newProfilePic, setNewProfilePic] = useState<any>(null);
	const [user, setUser] = useState<string>(null);
	const [_id, set_id] = useState<string>(null);

	useEffect(() => {
		const fetchUserDetails = async () => {
			try {
				let isConnectedtoOrbis = await orbis.isConnected();
				console.log(isConnectedtoOrbis);
				if (!isConnectedtoOrbis) {
					await orbis.connect_v2({
						provider: window?.phantom?.solana,
						chain: 'solana',
					});
				}
				const res = await axios.get('https://proto-api.onrender.com/users', {
					params: { wallet_address: wallet.publicKey },
				});
				setUserName(res.data[0].name);
				setProfilePic(res.data[0].profile_picture);
				set_id(res.data[0]._id);
			} catch (e) {
				console.log(e);
			}
		};
		if (wallet.publicKey) fetchUserDetails();
	}, [wallet.publicKey]);

	// async function connect() {
	// 	let res = await orbis.connect_v2({
	// 		provider: window?.phantom?.solana,
	// 		chain: 'solana',
	// 	});

	// 	if (res.status == 200) {
	// 		setUser(res.did);
	// 		console.log(user);
	// 		const { data, error } = await orbis.getDids(wallet.publicKey);
	// 		console.log('connect fn:', data[0]);
	// 		setUserName(data[0].details.profile.username);
	// 		setProfilePic(data[0].details.profile.pfp);
	// 	} else {
	// 		console.log('Error connecting to Ceramic: ', res);
	// 		alert('Error connecting to Ceramic.');
	// 	}
	// }

	const handleImageUpload = async (e: any) => {
		try {
			const file = e.target.files[0];
			const added = await client.add(file);
			if (added) {
				setNewProfilePic({ filename: file.name, hash: added.path });

				console.log(newProfilePic);
			}

			if (newProfilePic) {
				const orbisImageUploadResponse = await orbis.updateProfile({
					username: userName,
					pfp: `https://ipfs.io/ipfs/${newProfilePic?.hash}`,
				});
				console.log(orbisImageUploadResponse);
				const imageUploadResponse = await axios.patch(
					`https://proto-api.onrender.com/users/${_id}`,
					{
						profile_picture: {
							hash: newProfilePic.hash,
							filename: newProfilePic.filename,
						},
					}
				);
				console.log(imageUploadResponse);
				if (imageUploadResponse.status === 200) setProfilePic(newProfilePic);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleChangeUserName = (e) => {
		setNewUserName(e.target.value);
		setEditingUserName(true);
	};

	const handleSaveUserName = () => {
		setUserName(newUserName);
		setEditingUserName(false);
		const updateOrbisUserName = async () => {
			try {
				await orbis.updateProfile({
					username: newUserName,
					pfp: profilePic,
				});
			} catch (e) {
				console.log(e);
			}
		};
		const updateUserName = async () => {
			try {
				const res = await axios.patch(`https://proto-api.onrender.com/users/${_id}`, {
					name: newUserName,
				});
			} catch (e) {
				console.log(e);
			}
		};
		updateUserName();
		updateOrbisUserName();
	};

	return (
		<>
			<div>
				<div className=' align-middle h-[calc(100vh-200px)] max-w-[600px] mx-auto'>
					<div className='p-6'>
						<label className='relative'>
							<ChakraImage
								src={
									profilePic
										? `https://ipfs.io/ipfs/${profilePic?.hash}`
										: '/profileplaceholder.svg'
								}
								alt='/'
								objectFit='cover'
								className='mx-auto rounded-full object-cover h-32 w-32 cursor-pointer border border-[#b6b8b9]'
							/>
							<p className='text-[#AEB4B7] text-center mt-1 text-xs font-medium cursor-pointer'>
								{!profilePic ? 'Add a pic' : 'Change'}
							</p>
							<input
								type='file'
								className='absolute top-0 left-0 w-32 h-36 m-auto opacity-0 cursor-pointer z-0'
								// onChange={onImageUpload}
								onChange={(e) => handleImageUpload(e)}
							/>
						</label>
						<div className='flex items-center mt-6'>
							{/* <p className='font-medium'>Username</p> */}
							{!userName ? (
								<FormControl>
									<FormLabel
										fontSize='sm'
										mb='-0.5px'
										color='gray.500'
										fontWeight={400}>
										Username
									</FormLabel>
									<InputGroup>
										<Input
											placeholder='Set a username...'
											borderColor='#E2E8F0'
											type='text'
											onChange={handleChangeUserName}
										/>
										<InputRightElement w='4.5rem'>
											{editingUserName &&
											newUserName.length !== 0 &&
											userName !== newUserName ? (
												<Center>
													<Button
														h='32px'
														mr='4px'
														colorScheme='telegram'
														bg='primary'
														color='#fff'
														onClick={handleSaveUserName}>
														Save
													</Button>
												</Center>
											) : null}
										</InputRightElement>
									</InputGroup>
									<FormHelperText color='gray.400'>
										*You can only set your username once
									</FormHelperText>
								</FormControl>
							) : (
								<p className='text-center font-medium text-2xl text-gray-700 mx-auto'>
									{userName}
								</p>
							)}
						</div>
						<Options />
					</div>

					<div className='flex w-full items-center justify-center pb-24'>
						<DiscordLogo />
						<TwitterLogo />
						<InstagramLogo />
					</div>
				</div>
			</div>
		</>
	);
}
