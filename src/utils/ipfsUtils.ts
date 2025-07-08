
export interface IPFSUploadResult {
  imageHash: string;
  metadataHash: string;
}

export const uploadToIPFS = async (
  imageUrl: string,
  metadata: any,
  pinataApiKey: string,
  pinataSecretKey: string
): Promise<IPFSUploadResult> => {
  console.log('Starting IPFS upload process...');

  try {
    // Convert image URL to blob
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    // Upload image to IPFS via Pinata
    const imageFormData = new FormData();
    imageFormData.append('file', imageBlob, 'ai-generated-image.png');
    imageFormData.append('pinataMetadata', JSON.stringify({ name: 'AI Generated NFT Image' }));

    const imageUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey,
      },
      body: imageFormData,
    });

    if (!imageUploadResponse.ok) {
      throw new Error(`Image upload failed: ${imageUploadResponse.statusText}`);
    }

    const imageResult = await imageUploadResponse.json();
    const imageHash = imageResult.IpfsHash;
    console.log('Image uploaded to IPFS:', imageHash);

    // Update metadata with IPFS image URL
    const updatedMetadata = {
      ...metadata,
      image: `ipfs://${imageHash}`,
    };

    // Upload metadata to IPFS
    const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey,
      },
      body: JSON.stringify({
        pinataContent: updatedMetadata,
        pinataMetadata: { name: 'AI Generated NFT Metadata' },
      }),
    });

    if (!metadataResponse.ok) {
      throw new Error(`Metadata upload failed: ${metadataResponse.statusText}`);
    }

    const metadataResult = await metadataResponse.json();
    const metadataHash = metadataResult.IpfsHash;
    console.log('Metadata uploaded to IPFS:', metadataHash);

    return {
      imageHash,
      metadataHash,
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};
