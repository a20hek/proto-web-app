import {
  ConfirmOptions,
  Connection,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';

import { utils, Program, AnchorProvider } from '@project-serum/anchor';

import { latLngToCell } from 'h3-js';
import axios from 'axios';

const opts: ConfirmOptions = {
  preflightCommitment: 'processed',
};

let baseUrl = 'https://proto-api.onrender.com';

const network =
  'https://solana-devnet.g.alchemy.com/v2/6nOSXYNw7tWYjDzvQ2oLBVBfMg6Gj9Ho';

const getProvider = async () => {
  const connection = new Connection(network, opts.preflightCommitment);
  const provider = [window.solana, window.solflare, window.backpack].find(
    (p) => p && p.isConnected
  );

  if (!provider) throw new Error('No provider available');
  if (!provider.isConnected) await provider.connect();
  return new AnchorProvider(connection, provider, opts);
};

const getProgram = async () => {
  const provider = await getProvider();
  const idl = await Program.fetchIdl(
    process.env.NEXT_PUBLIC_PROGRAM_ID,
    provider
  );
  return new Program(idl, process.env.NEXT_PUBLIC_PROGRAM_ID, provider);
};

export async function CheckInTransaction(
  mongoId: string,
  lat,
  lng,
  checkInMessage,
  setPdl,
  setcheckIn,
  setCheckInSignature,
  checkInSignature
) {
  const provider = await getProvider();
  const hindex = latLngToCell(lat, lng, 7);

  const program = await getProgram();

  console.log(provider);

  const [checkInPDA] = PublicKey.findProgramAddressSync(
    [
      utils.bytes.utf8.encode('check-in-data'),
      provider.publicKey.toBuffer(),
      Buffer.from(mongoId),
      Buffer.from(hindex),
    ],
    program.programId
  );

  try {
    const sig = await program.methods
      .checkIn(hindex, mongoId, checkInMessage)
      .accounts({
        user: provider.wallet.publicKey,
        checkIn: checkInPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(sig);
    // save generated pdl for this checkin
    // setCheckInSignature(sig);

    const checkinPdlResponse = await axios({
      method: 'post',
      url: `${baseUrl}/checkins/${mongoId}/pdls`,
      data: {
        pdl: checkInPDA,
        signature: sig,
      },
    });
    setPdl(checkInPDA.toString());
    setcheckIn(checkinPdlResponse.data);
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}
