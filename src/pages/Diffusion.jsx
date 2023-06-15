import T from "../utils/Latex";
import * as d3 from "d3";
import Slider from "../utils/Slider";
import { createEffect, createSignal, onMount } from "solid-js";

export default function Diffusion() {
    const [expanded, setExpanded] = createSignal(false);

    const toggleTableOfContents = () => {
        setExpanded(!expanded());
    };

    return <>
        <article class="prose-custom prose-lg">
            <h1 class="!mb-0">Diffusion: A Deep Dive</h1>
            <p class="text-base !text-gray-500 !mt-0">June 5, 2023</p>
            <div class="table-of-contents">
                <h2 class="table-of-contents-header !text-lg font-semibold bg-slate-200 p-2 pl-4 rounded-lg w-full text-left cursor-pointer"
                    onClick={toggleTableOfContents}>
                    Table of Contents
                </h2>
                {expanded() && (
                    <ul class="table-of-contents-list">
                        <li><a href="#data-synthesis">How Do We Synthesize Data?</a></li>
                        <li><a href="#forward-diffusion">The Forward Diffusion Process</a></li>
                        <li><a href="#reverse-diffusion">The Reverse Diffusion Process</a></li>
                        <li><a href="#objective-function">The Objective Function (Variational Lower Bound)</a></li>
                    </ul>
                )}
            </div>
            <h2 id="data-synthesis">How Do We Synthesize Data?</h2>
            <p>
                In general, when we want to synthesize data in machine learning, we make the assumption that our data comes from some kind of probability distribution <T>{"q(\\mathbf{x})"}</T>, and that our current dataset is simply sampled from that distribution <T>{"(\\mathbf{x_0} \\sim q(\\mathbf{x}))"}</T>
                [add source here]. Our goal is to approximate or learn that distribution, so that we could sample new data from it. The original distribution is not known to us. All we have is the “sampled” data from that distribution, which is why we have to learn an approximation of it.
            </p>
            <p class="text-center bg-black"><strong class="!text-zinc-50"> TODO: add two illustrative graphs showing one distribution, and next to it is a sample from it, and draw an approximation of the distribution (use gaussian for simplicity) </strong></p>
            <p>
                We have a similar situation with image generation. We have a bunch of training images (the data), which we assume are sampled from an unknown data distribution (distribution of natural images). Our goal is to model that distribution so that we can sample from it new never-seen-before images. Sometimes, just like in the case of diffusion models, we may not be able to explicitly express the data distribution, but only be able to sample from it.
            </p>
            <p class="text-center bg-black"><strong class="!text-zinc-50"> TODO: add an image illustrating the concept of sampling images from a distribution</strong></p>
            <p>Now let’s dive deeper into the anatomy of diffusion.</p>
            <h2 id="forward-diffusion">The Forward Diffusion Process</h2>
            <p>
                In the forward process of diffusion, we start with an image sampled from the data distribution and add small Gaussian noise to it in <T>T</T> steps. These steps result in a series of progressively noisier images denoted by <T>{"\\mathbf{x}_0, \\mathbf{x}_1, \\ldots, \\mathbf{x}_T"}</T>. Each step adds noise based on a variance schedule <T>{"\\beta_t \\in (0, 1)"}</T>, which is an array of variances for each of the steps: <T>{"\\beta = [\\beta_1, \\beta_2, \\ldots, \\beta_T]"}</T>.
            </p>
            <p>
                The process of creating these noisy images forms a <strong>Markov chain</strong>. In this context, a Markov chain means that the distribution of a noisy image at a given time step <T>t</T> is only dependent on the less noisy image from the previous timestep <T>t-1</T>, not any earlier timesteps.
            </p>
            <p>We can express the distribution of images at each timestep with the equation: </p>
            <p>
                <T displayMode="true">
                    {"q(\\mathbf{x}_t \\mid \\mathbf{x}_{t-1}) = \\mathcal{N}(\\mathbf{x}_t; \\sqrt{1-\\beta_t}\\mathbf{x}_{t-1}, \\beta_t \\mathbf{I})"}
                </T>
            </p>
            <p>
                <T>{"q(\\mathbf{x}_t \\mid \\mathbf{x}_{t-1})"}</T>represents the conditional distribution of the noisy image at time <T>t</T>, given the slightly less noisy image at time <T>t-1</T>. The covariance matrix is defined as <T>{"\\beta_t \\mathbf{I}"}</T>, which means we have fixed our distribution so that each pixel has a variance of <T>\beta_t</T> and there is no covariance between each pixel.
            </p>
            <p>
                <strong>The Markov property</strong> of our forward process and the chain rule for probability allows us to derive the total conditional probability of transitioning from the initial state <T>{"\\mathbf{x}_0"}</T> to the final state <T>{"\\mathbf{x}_T"}</T> through the intermediate states <T>{"\\mathbf{x}_1, \\mathbf{x}_2, \\ldots, \\mathbf{x}_{T - 1}"}</T>. We can express this as:
            </p>
            <p>
                <T displayMode="true">
                    {"\\begin{align*} q(\\mathbf{x}_1, \\ldots, \\mathbf{x}_T \\mid \\mathbf{x}_0) &= q(\\mathbf{x}_1 \\mid \\mathbf{x}_0) q(\\mathbf{x}_2 \\mid \\mathbf{x}_1, \\mathbf{x}_0) q(\\mathbf{x}_3 \\mid \\mathbf{x}_2, \\mathbf{x}_1, \\mathbf{x}_0) \\ldots q(\\mathbf{x}_T \\mid \\mathbf{x}_{T-1}, \\ldots, \\mathbf{x}_0) \\\\ &= q(\\mathbf{x}_1 \\mid \\mathbf{x}_0) q(\\mathbf{x}_2 \\mid \\mathbf{x}_1) q(\\mathbf{x}_3 \\mid \\mathbf{x}_2) \\ldots q(\\mathbf{x}_T \\mid \\mathbf{x}_{T-1}) \\\\ &= \\prod_{t=1}^T q(\\mathbf{x}_t \\mid \\mathbf{x}_{t-1}) \\end{align*}"}
                </T>
            </p>
            <p>
                This equation, which is a form of the chain rule for Markov processes, shows how the probability of each step is a product of the probabilities of the individual transitions.
            </p>
            <p class="text-center bg-black"><strong class="!text-zinc-50"> TODO: add an intuitive diagram of the markov chain transitions in the context of images </strong></p>
            <p>
                Importantly, the mean pixel value at each step is a fraction of the pixel values from the previous image, because <T>{"\\sqrt{1-\\beta_t}"}</T> is a value between 0 and 1. This has the effect of fading the mean toward 0 as the forward process continues. This ensures that our image distribution <T>{"q(\\mathbf{x}_1, \\ldots, \\mathbf{x}_T \\mid \\mathbf{x}_0)"}</T> approximates a unit Gaussian distribution <T>{"\\mathcal{N}(\\mathbf{x}_T; 0, \\mathbf{I})"}</T>. This property is crucial because it allows us to efficiently sample from and manipulate the distribution, which is a key strength of diffusion models.
            </p>
            <p>
                In the following illustration, I’ve made the variance schedule to be linear starting at 0.0001 and ending at 0.02. Feel free to change that if you want and see how it affects the process.
            </p>
            <p class="text-center bg-black"><strong class="!text-zinc-50"> TODO: *INSERT ILLUSTRATION WHERE USER ADDS NOISE BY PRESSING A BUTTON AND GETS THE CHANCE TO EDIT BETA_MIN AND BETA_MAX AND RESET, PERHAPS ALSO DISPLAY THE SCHEDULER AS A GRAPH, OF BOTH VARIANCE AND MEAN. MAYBE ADD COS SCHEDULER AS A CHOICE* </strong></p>
            <p>
                It’s quite tedious to try to add noise step by step until we get desired time step <T>t</T>. There is a way to get the noisy image at time step <T>t</T> from <T>{"\\mathbf{x}_0"}</T> in just one computation. Recall that using the reparametrization step, sampling from a gaussian distribution <T>{"\\mathcal{N}(\\mathbf{x}_t; \\mu, \\sigma)"}</T> can be done as follows:
            </p>
            <p>
                <T displayMode="true">
                    {"x = \\mu + \\sigma \\epsilon \\quad \\text{where} \\quad \\epsilon \\sim \\mathcal{N}(0, 1)"}
                </T>
            </p>
            <p>
                We can use this concept to sample from our distribution <T>{"q(\\mathbf{x}_t \\mid \\mathbf{x}_0)"}</T> by sampling from a unit Gaussian distribution <T>{"\\mathcal{N}(\\mathbf{0}, \\mathbf{I})"}</T> and transforming it as follows:
            </p>
            <T displayMode="true">
                {"\\mathbf{x}_t = \\sqrt{1 - \\beta_t} \\mathbf{x}_{t - 1} + \\sqrt{\\beta_t} \\epsilon_{t-1} \\text{ where } \\epsilon_{t-1} \\sim \\mathcal{N}(\\mathbf{0}, \\mathbf{I})"}
            </T>
            <p>
                Let's define <T>{"\\alpha_t = 1 - \\beta_t"}</T> for convenience. Thus:
            </p>
            <T displayMode="true">
                {"\\mathbf{x}_t = \\sqrt{\\alpha_t} \\mathbf{x}_{t - 1} + \\sqrt{1 - \\alpha_t} \\mathbf{\\epsilon}_{t-1}"}
            </T>
            <p>
                We can now recursively apply this to <T>{"\\mathbf{x}_{t-1}"}</T> to get:
            </p>
            <T displayMode="true">
                {"\\begin{align*} \\mathbf{x}_t &= \\sqrt{\\alpha_t} \\mathbf{x}_{t - 1} + \\sqrt{1 - \\alpha_t} \\epsilon_{t-1} \\\\ &= \\sqrt{\\alpha_t} \\left(\\sqrt{\\alpha_{t-1}} \\mathbf{x}_{t - 2} + \\sqrt{1 - \\alpha_{t-1}} \\epsilon_{t-2} \\right) + \\sqrt{1 - \\alpha_t} \\epsilon_{t-1} \\\\ &= \\sqrt{\\alpha_t \\alpha_{t-1}} \\mathbf{x}_{t - 2} + \\sqrt{\\alpha_t (1 - \\alpha_{t-1})} \\epsilon_{t-2} + \\sqrt{1 - \\alpha_{t}} \\epsilon_{t-1} \\end{align*}"}
            </T>
            <p>
                When we add two gaussian distributions, just like in <T>{"\\sqrt{\\alpha_t (1 - \\alpha_{t-1})} \\epsilon_{t-2} + \\sqrt{1 - \\alpha_{t}} \\epsilon_{t-1}"}</T>, we get another gaussian distribution such that:
            </p>
            <ul>
                <li>The new mean equal to the sum of the two means (both 0 in this case)</li>
                <li>The variance equal to the sum of the two variances <T>{"\\alpha_t (1 - \\alpha_{t-1}) + (1 - \\alpha_{t})"}</T></li>
                <li>Thus, the new standard deviation is <T>{"\\sqrt{\\alpha_t (1 - \\alpha_{t-1}) + (1 - \\alpha_{t})}"}</T></li>
            </ul>
            <p>Let <T>{"\\bar{\\epsilon}_{t-2}"}</T> be the merged version of <T>{"\\epsilon_{t-2}"}</T> and <T>{"\\epsilon_{t-1}"}</T> such that it's also sampled from <T>{"\\mathcal{N}(\\mathbf{0}, \\mathbf{I})"}</T>. Therefore, we get this:</p>
            <T displayMode="true">
                {"\\mathbf{x}_t = \\sqrt{\\alpha_t \\alpha_{t-1}} \\mathbf{x}_{t - 2} + \\sqrt{\\alpha_t (1 - \\alpha_{t-1})} \\bar{\\epsilon}_{t-2}"}
            </T>
            <p>If we recursively apply this, we get:</p>
            <T displayMode="true">
                {"\\mathbf{x}_t = \\sqrt{\\bar{\\alpha}_t} \\mathbf{x}_{0} + \\sqrt{1 - \\bar{\\alpha}_t} \\bar{\\epsilon}_{0}, \\ \\ \\text{where} \\ \\ \\bar{\\alpha}_t = \\prod_{i=1}^{t} \\alpha_i"}
            </T>
            <p>
                We can now express the distribution of <T>{"\\mathbf{x}_t"}</T> given <T>{"\\mathbf{x}_0"}</T> as:
            </p>
            <p>
                <T displayMode="true">
                    {"q(\\mathbf{x}_t \\mid \\mathbf{x}_0) = \\mathcal{N}(\\mathbf{x}_t; \\sqrt{\\bar{\\alpha}_t} \\mathbf{x}_{0}, \\sqrt{1 - \\bar{\\alpha}_t} \\mathbf{I})"}
                </T>
            </p>
            <p>
                This means that we can sample <T>{"\\mathbf{x}_t"}</T> directly from <T>{"\\mathbf{x}_0"}</T> by scaling <T>{"\\mathbf{x}_0"}</T> by <T>{"\\sqrt{\\bar{\\alpha}_t}"}</T> and adding Gaussian noise with variance <T>{"1-\\bar{\\alpha}_t"}</T>.
            </p>
            <p class="text-center bg-black"><strong class="!text-zinc-50"> INSERT ILLUSTRATION WHERE USER CAN NOW USE A SLIDER TO JUMP BETWEEN STEPS, OR JUST TYPE THE SPECIFIC STEP THEY WANT. ALSO ALLOW TO EDIT VARIANCE SCHEDULER.</strong></p>
            <h2 id="reverse-diffusion">The Reverse Diffusion Process</h2>
            <p>
                The usefulness of diffusion models comes in reversing the forward process. In other words, we want to start at an image <T>{"\\mathbf{x}_T"}</T>, sampled from a unit diagonal gaussian, and iteratively remove noise until we get to <T>{"\\mathbf{x}_0"}</T>. Therefore, what we want to learn now is <T>{"q(\\mathbf{x}_{t-1} \\mid \\mathbf{x}_t)"}</T>: for a given image at timestep <T>t</T>, what is the distribution of images <T>{"\\mathbf{x}_t"}</T> could have come from at <T>t-1</T>? Because <T>\beta_t</T> is very small and our time steps are large, it can be shown that the reverse process has the same functional form as the forward process.
            </p>
            <p>
                <T displayMode="true">
                    {"q(\\mathbf{x}_{t-1} \\mid \\mathbf{x}_t) = \\mathcal{N}(\\mathbf{x}_{t-1}; \\mu_{\\mathbf{x}_{t-1}}, \\sigma_{\\mathbf{x}_{t-1}})"}
                </T>
            </p>
            <p>
                However, we can’t easily find <T>{"q(\\mathbf{x}_{t-1} \\mid \\mathbf{x}_t)"}</T> because that involves having a notion of what natural images from the dataset look like (as we talked about in the first blog). Therefore, we model <T>{"q(\\mathbf{x}_{t-1} \\mid \\mathbf{x}_t)"}</T> with <T>{"p_\\theta(\\mathbf{x}_{t-1} \\mid \\mathbf{x}_t)"}</T>, which will usually be a deep neural network with learned parameters <T>\theta</T>.
            </p>
            <p>
                <T displayMode="true">
                    {"q(\\mathbf{x}_{t-1} \\mid \\mathbf{x}_t) \\approx p_\\theta(\\mathbf{x}_{t-1} \\mid \\mathbf{x}_t) = \\mathcal{N}(\\mathbf{x}_{t-1}; \\mu_\\theta(\\mathbf{x}_t, t), \\Sigma_\\theta(\\mathbf{x}_t, t))"}
                </T>
            </p>
            <p>
                The reverse process also forms a markov chain.
            </p>
            <T displayMode="true">
                {"p_\\theta(\\mathbf{x}_{0:T}) = p(\\mathbf{x}_T) \\prod_{t=1}^T p_\\theta(\\mathbf{x}_{t-1} \\mid \\mathbf{x}_{t})"}
            </T>
            <p>
                Where <T>{"\\mathbf{x}_{0:T} = \\mathbf{x}_0, \\mathbf{x}_1, \\dots, \\mathbf{x}_T"}</T>.
            </p>
            <h2 id="objective-function">The Objective Function (Variational Lower Bound)</h2>
        </article>
        <footer>
            <div class="h-80"></div>
        </footer>
    </>
}