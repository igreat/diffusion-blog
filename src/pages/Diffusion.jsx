import T from "../utils/Latex";
import * as d3 from "d3";
import Slider from "../utils/Slider";
import { createEffect, createSignal, onMount } from "solid-js";

// TODO: make KL divergence non slanted
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
                    {`
                    \\begin{align*} 
                        q(\\mathbf{x}_1, \\ldots, \\mathbf{x}_T \\mid \\mathbf{x}_0) &= q(\\mathbf{x}_1 \\mid \\mathbf{x}_0) q(\\mathbf{x}_2 \\mid \\mathbf{x}_1, \\mathbf{x}_0) \\ldots q(\\mathbf{x}_T \\mid \\mathbf{x}_{T-1}, \\ldots, \\mathbf{x}_0) \\ \\text{(chain rule)} \\\\ 
                        &= q(\\mathbf{x}_1 \\mid \\mathbf{x}_0) q(\\mathbf{x}_2 \\mid \\mathbf{x}_1) \\ldots q(\\mathbf{x}_T \\mid \\mathbf{x}_{T-1}) \\ \\text{(markov property)} \\\\ 
                        &= \\prod_{t=1}^T q(\\mathbf{x}_t \\mid \\mathbf{x}_{t-1}) 
                    \\end{align*}`}
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
                It’s quite tedious to add noise step by step until we get desired time step <T>t</T>. There is a way to get the noisy image at time step <T>t</T> from <T>{"\\mathbf{x}_0"}</T> in just one computation. Recall that using the reparametrization step, sampling from a gaussian distribution <T>{"\\mathcal{N}(x; \\mu, \\sigma)"}</T> can be done as follows:
            </p>
            <p>
                <T displayMode="true">
                    {"x = \\mu + \\sigma \\epsilon \\quad \\text{where} \\quad \\epsilon \\sim \\mathcal{N}(0, 1)"}
                </T>
            </p>
            <p>
                We can use this concept to sample from our distribution <T>{"q(\\mathbf{x}_t \\mid \\mathbf{x}_{t-1})"}</T> by sampling from a unit Gaussian distribution <T>{"\\mathcal{N}(\\mathbf{0}, \\mathbf{I})"}</T> and transforming it as follows:
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
                <li>Thus, the new standard deviation is <T>{"\\sqrt{\\alpha_t (1 - \\alpha_{t-1}) + (1 - \\alpha_{t})} = \\sqrt{1 - \\alpha_{t}\\alpha_{t-1}}"}</T></li>
            </ul>
            <p>Let <T>{"\\bar{\\epsilon}_{t-2}"}</T> be the merged version of <T>{"\\epsilon_{t-2}"}</T> and <T>{"\\epsilon_{t-1}"}</T> such that it's also sampled from <T>{"\\mathcal{N}(\\mathbf{0}, \\mathbf{I})"}</T>. Therefore, we get this:</p>
            <T displayMode="true">
                {"\\mathbf{x}_t = \\sqrt{\\alpha_t \\alpha_{t-1}} \\mathbf{x}_{t - 2} +  \\sqrt{1 - \\alpha_{t}\\alpha_{t-1}} \\bar{\\epsilon}_{t-2}"}
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
                    {"q(\\mathbf{x}_t \\mid \\mathbf{x}_0) = \\mathcal{N}(\\mathbf{x}_t; \\sqrt{\\bar{\\alpha}_t} \\mathbf{x}_{0}, (1 - \\bar{\\alpha}_t) \\mathbf{I})"}
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
            <h2 id="objective-function">The Objective Function</h2>
            <p>
                We'll now walk through the objective function that guides the training of the reverse diffusion process. From earlier, we discussed how our goal is to approximate <T>{"q(\\mathbf{x})"}</T>. <T>{"q(\\mathbf{x})"}</T> will naturally assign higher probabilities to images observed in our training dataset <T>{"\\mathbf{x}_0"}</T>. Thus, it's a reasonable objective to maximize <T>{"p_{\\theta}(\\mathbf{x}_{0})"}</T> — the likelihood our model assigns to the training images.
            </p>
            <h3 id="intractability">Intractability</h3>
            <p>
                To directly compute <T>{"p_{\\theta}(\\mathbf{x}_{0})"}</T>, we have to marginalize over all possible <T>{"\\mathbf{x}_{1:T}"}</T> (all possible trajectories that arrive to <T>{"\\mathbf{x}_0"}</T> when starting from random noise):
            </p>
            <T displayMode="true">
                {"p_{\\theta}(\\mathbf{x}_{0}) = \\int_{\\mathbf{x}_{1:T}} p_{\\theta}(\\mathbf{x}_{0:T}) d\\mathbf{x}_{1:T} \\ \\text{(law of total probability)}"}
            </T>
            <p>
                This is intractable, there is no closed form solution to this integral.
            </p>
            <h3 id="variational-lower-bound">Variational Lower Bound</h3>
            <p>
                We instead resort to maximizing the variational lower bound (VLB) of <a href="#log-note"><T>{"\\log{p_{\\theta}(\\mathbf{x}_{0})}"}</T>*</a>. The VLB loss <T>{"L_{\\text{VLB}}"}</T> (which we aim to minimize rather than maximize, hence it's the negative of the VLB) can be derived to be the following:
            </p>
            <T displayMode="true">
                {`
                \\begin{align*} 
                    L_{\\text{VLB}} &= L_{T} + L_{T - 1} + \\dots + L_{0} \\\\
                    &\\text{where ... } \\\\
                    L_0 &= - \\log p_{\\theta}(\\mathbf{x}_{0} \\mid \\mathbf{x}_{1}) \\\\
                    L_t &= D_{\\text{KL}}\\left[q(\\mathbf{x}_{t} \\mid \\mathbf{x}_{t+1}, \\mathbf{x}_0) \\ || \\ p_{\\theta}(\\mathbf{x}_{t} \\mid \\mathbf{x}_{t+1})\\right] \\ \\text{for } t = 1, \\dots, T-1 \\\\
                    L_T &= D_{\\text{KL}}\\left[q(\\mathbf{x}_{T} \\mid \\mathbf{x}_0) \\ || \\ p(\\mathbf{x}_T)\\right]
                \\end{align*}
                `}
            </T>
            <ul>
                <li>
                    <T>{"L_0"}</T> can be interpreted as the reconstruction loss of the reverse process.
                </li>
                <li>
                    <T>{"L_t"}</T> gives us how close our model's distribution for the reverse process is to to the true distribution of the reverse process, when conditioned on <T>{"\\mathbf{x}_0"}</T>.
                </li>
                <li>
                    <T>{"L_T"}</T> is constant since the forward process is fixed and <T>{"\\mathbf{x}_T"}</T> assumed to be unit gaussian noise. We thus ignore it when optimizing for the most optimal model.
                </li>
            </ul>
            <p>
                Both <T>{"L_0"}</T> and <T>{"L_t"}</T> can be computed analytically. <T>{"L_0"}</T> is the negative log likelihood of a gaussian distribution, which has a closed form solution. <T>{"L_t"}</T> is the KL divergence between two gaussian distributions, which also has a closed form solution.
            </p>
            <p>
                I won't get into the derivation behind the VLB because it's mostly tedious algebraic manipulations and tricks. For those interested in every tiny detail, I highly recommend <a href="https://lilianweng.github.io/posts/2021-07-11-diffusion-models/">Lilian Weng's wonderful blog post on diffusion models</a> that goes through the tedious derivations that lead to <T>{"L_{\\text{VLB}}"}</T>.
            </p>
            <h3 id="simple-loss">A Simpler Objective Function</h3>
            <p>
                Although this VLB loss works just fine and can lead to good results, we can further derive a simpler objective function that is empirically easier to train with (it still aims to maximize <T>{"\\log{p_{\\theta}(\\mathbf{x}_{0})}"}</T>). The simpler objective function is the following:
            </p>
            <T displayMode="true">
                {`
                \\begin{align*}
                    L_{\\text{simple}} &= \\mathrm{E}_{t, \\mathbf{x}_{0}, \\epsilon}\\left[\\lVert \\epsilon_{t} - \\epsilon_{\\theta}(\\mathbf{x}_{t}, t) \\rVert^2 \\right] \\\\
                    &= \\mathrm{E}_{t, \\mathbf{x}_{0}, \\epsilon}\\left[\\lVert \\epsilon_{t} - \\epsilon_{\\theta}(\\sqrt{\\bar{\\alpha}}\\mathbf{x_0} + \\sqrt{1 - \\bar{\\alpha}} \\epsilon_{t}, t) \\rVert^2 \\right] \\\\
                \\end{align*}
                `}
            </T>
            <p>
                <T>{"L_{\\text{simple}}"}</T> is the mean squared error between the real noise <T>{"\\epsilon_{t}"}</T> (what we know we get from the forward process) and <T>{"\\epsilon_{\\theta}(\\mathbf{x}_{t}, t)"}</T> (what the model thinks the noise is). The reverse process now becomes a simple regression problem, where we aim to predict the noise that was added to the image at each step. During inference, we iteratively subtract the predicted noise from the noisy image to eventually get back the original image.
            </p>
            <p>
                The whole training and inference algorithms can now be done as follows:
            </p>
            <img
                class="mx-auto w-full"
                src="assets/DDPM training and sampling.png"
            />
            {/* TODO: cite this image */}
            <h2 id="results-conclusion">Results and Conclusion</h2>
            <p>
                At this point, I could go on and on about the various improvements we can make to improve results (including very interesting connections to stochastic differential equations), but I'll leave that for another time. For now, I'll just show some results from the models I trained using the exact formulation I've described above.
            </p>
            {/* TODO: train a model on various datasets and show results */}
            <p>
                For those interested in only the math and the conceptual side of diffusion, this is the end of the series. I truly hope you've enjoyed reading my blog posts as much as I've enjoyed writing them! We've explored some very interesting concepts and built a strong foundation on probability theory — a foundation that will help you understand many other concepts in all sorts of fields.
            </p>
            <p>
                For those interested in the code and implementation side of diffusion, I've written a follow-up blog post that goes through the exact code I used to train the models and generate the results above.
            </p>
            {/* foot notes */}
            <div class="text-base text-gray-500">
                <div class="h-80"></div>
                <p id="log-note">
                    *The VLB loss technically aims to maximize the log likelihood of the training data, but since the logarithm is a monotically increasing function, a model that maximizes the log likelihood of the training data will also maximize the likelihood of the training data.
                </p>
            </div>
        </article >
    </>
}