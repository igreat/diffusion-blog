import { A } from "@solidjs/router";

export default function Home() {
    return (
        <div class="relative">
            <img
                src="assets/diffusion-background.jpeg"
                alt="Diffusion Background"
                class="absolute top-0 left-0 w-full h-full object-cover"
            />
            <div class="relative bg-white bg-opacity-80 p-8">
                <div class="prose-custom">
                    <h1 class="text-3xl font-bold mx-auto">A Mathematical Dive Into Diffusion Models</h1>
                    <div class="">
                        <p class="font-medium !text-black text-2xl">
                            Welcome to our exploration into the world of AI-generated art and the technology behind it. Our focus is on
                            diffusion models like Stable Diffusion, which generate stunning imagery from randomness. As we progress
                            through this series, we'll demystify the complex algorithms and mathematics driving these models.
                        </p>
                    </div>
                    <div class="flex flex-row justify-center">
                        <A
                            class="text-2xl px-4 py-2 leading-none rounded-lg !text-gray-400 bg-gray-900 hover:bg-gray-500 hover:!text-gray-900 !no-underline"
                            href="/diffusion-blog/intro"
                        >
                            Go to Introduction
                        </A>
                    </div>
                </div>
            </div>
        </div>
    );
}
