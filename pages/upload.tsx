import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import axios from 'axios';
import { SanityAssetDocument } from '@sanity/client';

import useAuthStore from '@/store/authStore';
import { client } from '@/utils/client';
import { topics } from '@/utils/constants';
import { BASE_URL } from '@/utils';

const Upload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoAsset, setVideoAsset] = useState<
    SanityAssetDocument | undefined
  >();
  const [wrongFileType, setWrongFileType] = useState(false);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState(topics[0]);
  const [savingPost, setSavingPost] = useState(false);

  const { userProfile }: { userProfile: any } = useAuthStore();
  const router = useRouter();

  const uploadVideo = async (e: any) => {
    const selectedFile = e.target.files[0];
    console.log(selectedFile);

    const fileTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    if (fileTypes.includes(selectedFile.type)) {
      client.assets
        .upload('file', selectedFile, {
          contentType: selectedFile.type,
          filename: selectedFile.name,
        })
        .then((data) => {
          console.log(data);

          setVideoAsset(data);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setWrongFileType(true);
    }
  };

  const handlePost = async () => {
    if (caption && videoAsset?._id && category) {
      setSavingPost(true);
      const document = {
        _type: 'post',

        caption,
        video: {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: videoAsset?._id,
          },
        },
        userId: userProfile?._id,
        postedBy: {
          _type: 'postedBy',
          _ref: userProfile._id,
        },
        topic: category,
      };

      await axios.post(`${BASE_URL}/api/post`, document);
      router.push('/');
    }
  };

  return (
    <div className="flex w-[90vw] xl:w-[60vw] h-full absolute top-[60px] mb-10 xl:left-[40%] lg:pt-10 lg:justify-start xl  lg:left-48 sm:justify-center sm:left-12 ">
      <div className="bg-white rounded-lg xl:h-[80vh] w-[80%] flex gap-8 flex-wrap justify-center pt-6 md:justify-start  ">
        <div>
          <div>
            <p className="text-2xl font-bold">Upload Video</p>
            <p className="text-md text-gray-400 mt-1">
              Post a video to your account
            </p>
          </div>
          <div className="border-dashed border-4 rounded-lg  text-gray-300  hover:text-red-600  border-gray-200 flex flex-col justify-center items-center mt-10 outline-none w-[260px] h-[460px]  cursor-pointer hover:border-red-600 hover:bg-gray-200">
            {isLoading ? (
              <p>Uploading...</p>
            ) : (
              <div>
                {videoAsset ? (
                  <div>
                    <video
                      src={videoAsset.url}
                      loop
                      controls
                      className="rounded-lg h-[455px] w-[260px] bg-black"></video>
                  </div>
                ) : (
                  <div>
                    <label className="cursor-pointer">
                      <div
                        className="
                      flex flex-col h-full items-center justify-center
                      ">
                        <div
                          className="
                        flex flex-col items-center justify-center
                        ">
                          <p className="text-xl font-bold ">
                            {' '}
                            <FaCloudUploadAlt className="text-6xl" />
                          </p>
                          <p className="font-semibold ">Select your video</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        name="upload-video"
                        onChange={uploadVideo}
                        className="
                      w-0 h-0 
                      "
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
            {wrongFileType && (
              <p className="text-center text-xl text-red-600 font-semibold mt-4 w-[250px]">
                Please select a video file
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 md:pt-20 sm:pt-5 w-80">
          <label className="text-md font-medium">Caption</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
            }}
            className="rounded outline-none text-md border-2 border-gray-200 p-2"
          />
          <label className="text-md font-medium">Choose a Category</label>
          <select
            onChange={(e: any) => {
              setCategory(e.target.value);
            }}
            className="outline-none border-2 capitalize text-md border-gray-200 lg:p-4 p-2 cursor-pointer rounded ">
            {topics.map((topic) => (
              <option
                className="text-gray-700 outline-non capitalize text-md hover:bg-slate-300 hover:text-red-600"
                key={topic.name}
                value={topic.name}>
                {topic.name}
              </option>
            ))}
          </select>
          <div className="flex gap-6 mt-10">
            <button
              onClick={() => {}}
              className="border-gray-300 border-2 text-md font-medium p-2 rounded w-28 hover:border-red-600 hover:text-red-600 lg:w-44 outline-none active:bg-red-600 active:text-white active:border-red-600">
              Discard
            </button>
            <button
              onClick={handlePost}
              className=" border-2 text-md font-medium p-2 rounded w-28 lg:w-44 outline-none bg-red-600 text-white border-red-600">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
