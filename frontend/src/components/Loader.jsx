import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function Loader() {
  return (
    <div className="flex justify-center items-center w-full py-4">
      <DotLottieReact
        src="/images/global/loader.json"
        loop
        autoplay
        className="w-50 h-50"
      />
    </div>
  );
}