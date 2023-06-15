import { A } from "@solidjs/router";

// FIXME: the assets don't seem to work in build mode. 
export default function Home() {
    return <div class="prose-custom">
        <h1 class="text-3xl font-bold mx-auto">A Mathematical Dive Into Diffusion Models</h1>
        <div class="">
            <p class="font-medium">
                Welcome to our exploration into the world of AI-generated art and the technology behind it. Our focus is on diffusion models like Stable Diffusion, which generate stunning imagery from randomness. As we progress through this series, we will demystify the complex algorithms and mathematics driving these models, illuminating how they gradually refine a chaotic array of pixels into recognizable, beautiful art. Join us as we unveil the fascinating intersection of technology, creativity, and information theory.
            </p>
        </div>
        <div class="flex flex-row justify-center">
            <A class="text-2xl px-4 py-2 leading-none rounded-lg !text-gray-400 bg-gray-900 hover:bg-gray-500 hover:!text-gray-900 !no-underline" href="/intro">Go to Introduction</A>
        </div>
    </div>

}