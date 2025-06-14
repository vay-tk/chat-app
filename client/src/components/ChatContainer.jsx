import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();

  const [selectedImage, setSelectedImage] = useState(null);
  const [input, setInput] = useState('');

  // Send image or text
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await sendMessage({ image: reader.result });
        setSelectedImage(null);
      };
      reader.readAsDataURL(selectedImage.file);
      return;
    }

    if (input.trim() === '') return;
    await sendMessage({ text: input.trim() });
    setInput('');
  };

  // Preview image only
  const handleSendImage = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image');
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage({ file, previewUrl: imageUrl });
    e.target.value = ''; // Reset file input
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">

      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 rounded-full" />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7 filter invert cursor-pointer"
          onClick={() => setSelectedUser(null)}
        />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>

      {/* Chat Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== authUser._id && 'flex-row-reverse'
            }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt=""
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
              />
            ) : (
              <p
                className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                  msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'
                }`}
              >
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-7 h-7 rounded-full"
              />
              <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd} />
      </div>

      {/* Bottom input area */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-3 bg-black/20 backdrop-blur-md">

        {/* Image Preview */}
        {selectedImage && (
          <div className="relative w-fit max-w-[180px]">
            <img
              src={selectedImage.previewUrl}
              alt="Preview"
              className="w-full max-h-[180px] rounded-xl border border-gray-400 object-cover"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-black/80"
            >
              ×
            </button>
          </div>
        )}

        {/* Text input + send */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-gray-100/12 px-4 py-2 rounded-full">
            <input
              type="text"
              placeholder="Send a message"
              className="flex-1 text-sm p-2 bg-transparent border-none outline-none text-white placeholder-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
            />
            <input
              type="file"
              id="image"
              accept="image/png, image/jpeg"
              hidden
              onChange={handleSendImage}
            />
            <label htmlFor="image">
              <img
                src={assets.gallery_icon}
                alt="Gallery"
                className="w-6 h-6 mr-2 cursor-pointer"
              />
            </label>
          </div>
          <img
            src={assets.send_button}
            alt="Send"
            className="w-8 h-8 cursor-pointer"
            onClick={handleSendMessage}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
