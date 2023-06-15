import Home from './pages/Home';
import Intro from './pages/Intro';
import Probability from './pages/Probability';
import Diffusion from './pages/Diffusion';
import { Routes, Route, A } from "@solidjs/router";

function App() {
    return <div>
        <nav class="bg-gray-800 p-2 mt-0 w-full">
            <div class="container mx-auto flex flex-wrap items-center">
                <div class="flex w-full md:w-1/2 justify-center md:justify-start text-white font-extrabold">
                    {/* FIXME: make sure section that are currently clicked are white, and others are lighter */}
                    <A href="/diffusion-blog" class="text-white no-underline hover:text-white hover:no-underline">
                        <span class="text-2xl pl-2"><i class="em em-grinning"></i>Diffusion Deep Dive</span>
                    </A>
                </div>
                <div class="flex w-full pt-2 content-center justify-between md:w-1/2 md:justify-end">
                    <ul class="list-reset flex justify-between flex-1 md:flex-none items-center">
                        <li class="mr-3">
                            <A class="inline-block py-2 px-4 text-white no-underline" href="/diffusion-blog/intro">Introduction</A>
                        </li>
                        <li class="mr-3">
                            <A class="inline-block text-gray-600 no-underline hover:text-gray-200 hover:text-underline py-2 px-4" href="/diffusion-blog/probability">Probability Theory</A>
                        </li>
                        <li class="mr-3">
                            <A class="inline-block text-gray-600 no-underline hover:text-gray-200 hover:text-underline py-2 px-4" href="/diffusion-blog/diffusion">The Math of Diffusion</A>
                        </li>
                        <li class="mr-3">
                            <A class="inline-block text-gray-600 no-underline hover:text-gray-200 hover:text-underline py-2 px-4" href="#">The Code of Diffusion</A>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <br></br>

        <Routes>
            <Route path="/diffusion-blog" component={Home} />
            <Route path="/diffusion-blog/intro" component={Intro} />
            <Route path="/diffusion-blog/probability" component={Probability} />
            <Route path="/diffusion-blog/diffusion" component={Diffusion} />
        </Routes>
    </div >
}

export default App;
