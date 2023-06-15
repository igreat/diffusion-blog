import { createEffect, createSignal } from "solid-js";
import Slider from "../utils/Slider";

export default function Intro() {
    return <>
        <article class="prose-custom prose-lg">
            <h1 class="!mb-0">An Overview of Diffusion</h1>
            <p class="text-base !text-gray-500 !mt-0">May 23, 2023</p>
            <p>
                I’m sure many of us marveled at the power of the latest AI-generated art from the powerful text-to-image models, such as Stable Diffusion. These sophisticated technologies seem to breathe life into the inanimate, weaving pixels into masterpieces that have never graced our world before. But have you ever stopped to wonder how a mere computer program can birth such unprecedented imagery? In this section of our in-depth exploration of diffusion models, we’re going to introduce the basic idea behind diffusion models. In subsequent sections, we’ll dive deeper into the mathematical motivation and the specifics of these models.
            </p>
            <p>
                Let's begin by assuming that our diffusion model is already fully trained. So, how do we generate an image? The inference process is quite straightforward: we start with an image of random noise, typically drawn from a unit Gaussian distribution, and then progressively remove noise until we're left with an image that has no noise at all.
            </p>
            <p>
                <DiffusionSlider />
            </p>
            <p>
                Now, you might be wondering how it's plausible for this method to even work. How would starting with a noisy image and gradually reducing that noise lead to a recognizable, natural image?
                Let’s look at this image for example.
            </p>
            <img
                class="mx-auto max-w-[50%]"
                src="src/assets/noised-images-intro/lena/lena-14.png"
            />
            <p>
                As humans, we can distinguish between the noise and the meaningful part of the image. This is because we understand what a natural image of a woman should look like.
                Similarly, during the training phase, the diffusion model learns what a natural image should look like. This learning process allows it to understand the relationship between noise and the final output image.
                When we kick off the inference process with a random noise image, diffusion models act much like a prospector panning for gold. They sift through the chaos, latching onto certain concentrations of pixel values that lean toward a natural image, gradually removing noise to make this pattern more prominent.
            </p>
            <div class="justify-center">
                <img
                    class="max-w-[50%] inline !mt-0 !mb-0"
                    src="src/assets/noised-images-intro/lena/lena-14.png"
                />
                <img
                    class="max-w-[50%] inline !mt-0 !mb-0"
                    src="src/assets/noised-images-intro/lena/lena-1.png"
                />
            </div>
            <p>
                This process bears a striking resemblance to how we humans sometimes spot faces on the moon's surface or discern shapes in random spots.
            </p>
            <img
                class="mx-auto max-w-[50%]"
                src="src/assets/moon-face.jpg"
            />
            <p>
                But why is this technique called diffusion? The core concept behind diffusion models is inspired by the thermodynamics of gas molecules. In this natural phenomenon, molecules tend to move from areas of high density to those with lower density, a process known as diffusion. In the realm of physics, this idea is closely related to the principle that entropy in the universe is always on the rise. When we look at it through the lens of information theory, it translates to a gradual loss of information due to the constant presence of noise. <strong>actually there’s more to the story here</strong>.
                In the next section, we’ll formalize probability theory before we dive deep into the math behind diffusion.
            </p>
        </article>
        <footer>
            <div class="h-80"></div>
        </footer>
    </>
}

// TODO: make this visualization similar to how I made it in the slides
function DiffusionSlider() {
    const num_images = 20;
    const imageUrl = (i) => `src/assets/noised-images-intro/astronaut/astronaut-${num_images - parseInt(i) + 2}.jpg`

    const slider = new Slider("diffusion step", 1, num_images, 1, 1);
    const [img, setImg] = createSignal(imageUrl(1));

    createEffect(() => {
        setImg(imageUrl(slider.value()));
    });

    return (
        <div class="flex flex-col items-center">
            <img class="max-w-[50%] block !mb-0 !mt-1" src={img()} />
            {slider.render()}
        </div>
    );
}
