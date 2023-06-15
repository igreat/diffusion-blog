import T from "../utils/Latex";
import Card from "../utils/Card";
import * as d3 from "d3";
import * as math from "mathjs";
import Slider from "../utils/Slider";
import { createEffect, createSignal, onMount } from "solid-js";

export default function Probability() {
    const [expanded, setExpanded] = createSignal(false);

    const toggleTableOfContents = () => {
        setExpanded(!expanded());
    };

    return <>
        <article class="prose-custom prose-lg">
            <h1 class="!mb-0">Probability and Stats Background</h1>
            <p class="text-base !text-gray-500 !mt-0">May 24, 2023</p>
            <div class="table-of-contents">
                <h2 class="table-of-contents-header !text-lg font-semibold bg-slate-200 p-2 pl-4 rounded-lg w-full text-left cursor-pointer"
                    onClick={toggleTableOfContents}>
                    Table of Contents
                </h2>
                {expanded() && (
                    <ul class="table-of-contents-list">
                        <li><a href="#formalizing-probability">Formalizing Probability</a></li>
                        <li><a href="#useful-theorems">Useful Theorems</a></li>
                        <ul>
                            <li><a href="#bayes-theorem">Bayes' Theorem</a></li>
                            <li><a href="#law-of-total-probability">Law of Total Probability</a></li>
                            <li><a href="#chain-rule">Chain Rule</a></li>
                        </ul>
                        <li><a href="#probability-distributions">Probability Distributions</a></li>
                        <ul>
                            <li><a href="#random-variables">Random Variables</a></li>
                            <li><a href="#distributions">Distributions</a></li>
                            <li><a href="#gaussian-distribution">The Gaussian Distribution</a></li>
                            <li><a href="#sampling">Sampling From a Distribution</a></li>
                            <li><a href="#multivariate-gauss">Multivariate Gaussian Distribution</a></li>
                            <li><a href="#kl-divergence">Distance between Distributions</a></li>
                        </ul>
                    </ul>
                )}
            </div>

            <h2 id="formalizing-probability">Formalizing Probability</h2>
            <p>
                As we embark on our exploration of diffusion, it's essential to take a “small” detour to formalize the notion of probability. This will also introduce a lot of the notation that's going to pop up in our discussion, and some important concepts.
            </p>
            <p>
                I just want to make it clear that we won't be using all of the concepts introduced here. However, I think it's useful to have a broader foundation in probability theory. (It's also my way of sneaking in more cool math into this blog, sorry!)
            </p>
            <p>
                Before we delve into the laws and axioms, let's explore the motivation behind probability theory using an intuitive example. Consider a scenario involving the following statements:
            </p>
            <ul>
                <li class="text-[#155e75]"><T>{"A \\coloneqq \\text{It rains.}"}</T></li>
                <li class="text-[#155e75]"><T>{"B \\coloneqq \\text{The street is wet.}"}</T></li>
            </ul>
            <p>
                The implication <T>{"A \\implies B"}</T> can be understood as: "if it rains, then the street must be wet”. Consequently, the statement <T>{"\\neg{B} \\implies \\neg{A}"}</T> holds, which can be expressed in simpler terms as: “if the street is not wet, then it can't have rained"
            </p>
            <img src="/assets/rain.jpeg" alt="rain diffusion art" class="mx-auto max-w-[67%]" />
            <p>
                While this deductive reasoning provides us with absolute certainty, it falls short in addressing the plausibility of events. Deductive reasoning has its limitations; it can’t tell us which scenarios are more plausible than others. In real-world situations, we often grapple with varying degrees of plausibility. To navigate this uncertainty, we need a framework that can help us quantify and reason with probabilities. This is where probability theory comes in, providing us with a systematic approach to quantifying and reasoning with uncertainty.
            </p>
            <p>
                For instance, as humans, we intuitively understand that if it hasn't rained, the street not being wet becomes more plausible. This is not a situation Boolean Algebra can tell us anything about, since, of course, it's not a certainty – there could have been a person spraying water with a hose on the street. Likewise, if the street is wet, it's more plausible that it has rained.
            </p>
            <p>
                Probabilistic reasoning allows us to make statements like:
            </p>
            <ul>
                <li><span class="text-[#991b1b]"><T>{"P(A \\mid B) > P(A)"}</T></span>, which reads as "the probability of A given B has occurred is greater than the probability of A on its own". In other words, the probability of it having rained given the street is wet is greater than the probability of it having rained on its own. Knowing that the street is wet makes us more confident that it has rained.</li>
                <li><span class="text-[#991b1b]"><T>{"P(\\neg{B} \\mid \\neg{A}) > P(\\neg{B})"}</T></span>, which reads as "the probability of B not occurring given A has not occurred is greater than the probability of B not occurring on its own"</li>
            </ul>
            <p>
                Having established our motivation, let's lay the foundation for probability theory through an example of a fair, 6-sided die 🎲. We’ll first set up the notation.
            </p>
            <ul>
                <li>
                    <strong><T>{"\\Omega"}</T> sample space:</strong> This is the set of all possible outcomes. For a 6-sided die, this would be <T>{"\\{1, 2, 3, 4, 5, 6\\}."}</T>
                </li>
                <li>
                    <strong><T>{"F"}</T> event space:</strong> This is the set of all possible events. In the simplest case, each possible outcome is an event, so <T>{"F"}</T> could be the power set of <T>{`\\Omega`}</T>, including the empty set and <T>{`\\Omega`}</T> itself. Here's a subset of the events to give you an idea (full list would be rather long due to combinations):
                    <ul>
                        <li>
                            <T>{"\\{\\}, \\{1\\}, \\{2\\}, \\{3\\}, \\{4\\}, \\{5\\}, \\{6\\}"}</T> (the events of rolling each individual number)
                        </li>
                        <li>
                            <T>{"\\{1, 2\\}, \\{1, 3\\},"}</T> ... (the events of rolling either of two numbers)
                        </li>
                        <li>
                            <T>{"\\{1, 2, 3\\}, \\{1, 2, 4\\},"}</T> ... (the events of rolling any of three numbers)
                        </li>
                        <li><T>{"\\ldots"}</T></li>
                        <li>
                            <T>{"\\{1, 2, 3, 4, 5, 6\\}"}</T> (the certain event that some number comes up)
                        </li>
                    </ul>
                </li>
                <li>
                    <strong><T>{"P"}</T> (probability measure):</strong> This assigns to each event in <T>F</T> a probability. In the case of a fair 6-sided die, each individual outcome has a probability of <T>{"\\frac{1}{6}"}</T>, and the probabilities for the other events can be calculated based on this. For instance:
                    <ul>
                        <li>
                            <T>{"P(\\{1\\}) = \\frac{1}{6}"}</T> (the probability of rolling a 1)
                        </li>
                        <li>
                            <T>{"P(\\{1, 2\\}) = P(\\{1\\}) + P(\\{2\\}) = \\frac{1}{6} + \\frac{1}{6} = \\frac{1}{3}"}</T> (the probability of rolling either a 1 or a 2)
                        </li>
                        <li>
                            <T>
                                {"P(\\{1, 2, 3, 4, 5, 6\\}) = 1"}
                            </T>
                        </li>
                        <li>
                            And so forth for all events in <T>{"F"}</T>.
                        </li>
                    </ul>
                </li >
            </ul >
            <p>
                That last part, which describes <T>{"P"}</T>, requires us to lay out the axioms for probability, which go as follows:
            </p>
            <Card
                title="First Axiom"
                body={<p>The probability of an event is a non-negative real number.</p>}
                formula={"P(E) \\geq 0, \\, P(E) \\in \\mathbb{R}"}
            />
            <Card
                title="Second Axiom"
                body={<p>The probability that at least one of the elementary events in Ω will occur is 1.</p>}
                formula={"P(\\Omega) = 1"}
            />
            <Card
                title="Third Axiom"
                body={
                    <p>
                        Any countable sequence of disjoint sets (synonymous with mutually exclusive events) <T>E_1, E_2, \cdots</T>, satisfies
                    </p>
                }
                formula={"P\\left(\\bigcup_{i=1}^{\\infty} E_i\\right) = \\sum_{i=1}^{\\infty} P(E_i)"}
                example={
                    <p>
                        This basically says that the probability of union of disjoint events is the same as the sum of the probabilities of the individual events, as we saw for <T>{"P(\\{1\\} \\cup \\{2\\}) = P(\\{1, 2\\}) = P(\\{1\\}) + P(\\{2\\})"}</T> in the case of a 6-sided die.
                    </p>
                }
            />
            <p>These axioms are supplemented with a <strong>definition</strong> of conditional probability:</p>
            <Card
                title="Conditional Probability"
                body={
                    <p>
                        The conditional probability of <T>A</T> given <T>B</T> is defined as
                    </p>
                }
                formula={"P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}"}
            />
            <p>
                This equation is the foundation for updating belief. Say we have an event <T>{"A = \\{2\\}"}</T> (rolling a two in a 6-sided die). Without any extra information, we may say that the probability is <T>{"P(\\{2\\}) = \\frac{1}{6}"}</T>. However, let’s say we get extra information that the roll produced an even number. This brought down our possible outcomes to <T>{"\\{2, 4, 6\\}"}</T>.
            </p>
            <p>
                In this scenario, the new information given can be regarded as an event <T>{"B = \\{2, 4, 6\\}"}</T> - rolling an even number on a 6-sided die. Given this information, we're no longer considering the entire original sample space <T>{"\\Omega"}</T> but rather the reduced sample space of event B. We want to know the updated probability of event <T>{"A = \\{2\\}"}</T> given this new information, which is the conditional probability <T>{"P(A|B)"}</T>.
            </p>
            <p>
                We can calculate this conditional probability using the definition of conditional probability, which states that <T>{"P(A|B) = \\frac{P(A \\cap B)}{P(B)}"}</T>.
            </p>
            <p>
                In this case, event <T>A</T>, is completely contained within event <T>B</T>, so the intersection of <T>A</T> and <T>B</T>  is just <T>A</T> itself, and therefore <T>{"P(A \\cap B) = P(A) = \\frac{1}{6}"}</T>. The probability of event <T>B</T>, <T>{"P(B)"}</T>, is the sum of the probabilities of rolling a 2, 4, or 6, which is <T>{"\\frac{1}{6} + \\frac{1}{6} + \\frac{1}{6} = \\frac{1}{2}"}</T>.
            </p>
            <p>
                So, <T>{"P(A|B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{\\frac{1}{6}}{\\frac{1}{2}} = \\frac{1}{3}"}</T>.
            </p>
            <p>
                In other words, if we know that we’ve rolled an even number, the probability that we’ve rolled a 2 increases from <T>{"\\frac{1}{6}"}</T> to <T>{"\\frac{1}{3}"}</T>. This illustrates how probabilities can change when we receive new information - in this case, our belief in the event of rolling a 2 has been updated from <T>{"\\frac{1}{6}"}</T>  to <T>{"\\frac{1}{3}"}</T>  based on the information that an even number was rolled.
            </p>
            <p>
                This also beautifully demonstrates how conditional probability forms the basis for Bayesian reasoning, a powerful probabilistic approach for updating beliefs in light of new information.
            </p>
            <h2 id="useful-theorems">Useful Theorems For Probability</h2>
            Now that we have the basis for probability, we can derive some useful theorems that span a wide range of applications. We don't prove all these theorems here, but know that these can be derived from the axioms and definitions we've laid out above.
            <h3 id="bayes-theorem">Bayes' Theorem</h3>
            <p>
                Bayes' theorem can be derived directly from the definition of conditional probability. Let's start from the definition:
            </p>
            <p>
                <span class="text-[#991b1b]">
                    <T displayMode="true">
                        {`\\begin{align*}
                        P(A \\mid B) &= \\frac{P(A \\cap B)}{P(B)} \\\\
                        P(A \\mid B) P(B) &= P(A \\cap B) \\\\
                    \\end{align*}`}
                    </T>
                </span>
            </p>
            <p>Similarly, we can get the following: <T>{"P(B \\mid A) P(A) = P(B \\cap A)"}</T>.
                Thus, since <T>{"P(A \\cap B) = P(B \\cap A)"}</T>, we can say that
                <span class="text-[#991b1b]">
                    <T displayMode="true">
                        {`\\begin{align*}
                        P(A \\mid B) P(B) &= P(B \\mid A) P(A) \\\\
                        P(A \\mid B) &= \\frac{P(B \\mid A) P(A)}{P(B)} \\\\
                    \\end{align*}`}
                    </T>
                </span>
            </p>
            <Card
                title="Bayes' Theorem"
                body={<p>If we have an event <T>A</T> which we are interested about, and an event <T>B</T> that might provide information about <T>A</T>, then:</p>}
                formula={"P(A \\mid B) = \\frac{P(B \\mid A)P(A)}{P(B)}"}
            />
            <p>
                Bayes' theorem shows how to update our beliefs about the probability of event <T>{"A"}</T> in light of evidence <T>{"B"}</T>. This is the core of Bayesian reasoning.
            </p>
            <p>
                Another term that’s going to come up is the <strong>likelihood</strong> (or likelihood function). The likelihood is the probability of observing <T>x</T> (data) given a set of parameters <T>{"\\theta"}</T> of our model: <T>{"P(x \\mid \\theta)"}</T>. This is just another way of writing <T>{"P_\\theta(x)"}</T>, where we can view <T>{"P_\\theta(x)"}</T> as the probability our model assigns to <T>x</T>. <T>{"\\theta"}</T> can be thought of as our model itself here. Don’t worry if this doesn’t make much sense now, since this concept is mostly useful when we try to statistically model a distribution, which comes up in the next blog post.
            </p>
            <p>
                As a side note, in probability theory and other mathematical fields, the intersection of two events, <T>A</T> and <T>B</T>, is usually denoted as <T>{"A \\cap B"}</T>. However, in many texts, especially in the context of conditional probability and Bayes' theorem, the intersection is often simply denoted by <T>{"A, B"}</T>.
            </p>
            <p>
                So, when you see <T>{"P(A, B)"}</T>, it means the same as <T>{"P(A \\cap B)"}</T>, the probability that both <T>A</T> and <T>B</T> occur.
            </p>
            <p>
                The shorthand notation <T>{"P(A, B)"}</T> is especially handy when dealing with multiple conditional events, as it allows for a more compact representation.
            </p>
            <h3 id="law-of-total-probability">Law of Total Probability</h3>
            <p>
                The law of total probability is a useful theorem that allows us to compute the probability of an event <T>A</T> by conditioning on partitions of the sample space <T>{"\\Omega"}</T>. In other words, we can break down the sample space into mutually exclusive events, and then sum up the probabilities of <T>A</T> conditioned on each of these events. This is useful when we don't know the probability of <T>A</T> directly, but we do know the probability of <T>A</T> conditioned on each of the mutually exclusive events.
            </p>
            {/* TODO: insert venn diagram of probability of A and partitioning it */}
            <p class="text-center bg-black"><strong class="!text-zinc-50">TODO: insert svg diagram of probability of A and partitioning it</strong></p>
            <Card
                title="Law of Total Probability"
                body={
                    <p>
                        The law of total probability states that if <T>{"\\{B_1, B_2, \\dots, B_n\\}"}</T> is a partition of the sample space <T>{"\\Omega"}</T>, then
                    </p>
                }
                formula={"\\begin{align*} P(A) &= \\sum_{i=1}^n P(A \\cap B_i) \\\\ &= \\sum_{i=1}^n P(A \\mid B_i) P(B_i) \\end{align*}"}
            />
            <h3 id="chain-rule">Chain Rule (General Product Rule)</h3>
            <p>
                The chain rule, also known as the general product rule, is a useful theorem that allows us to compute the probability of the intersection of multiple events. This is useful when we don't know the probability of the intersection of multiple events directly, but we do know the probability of each event conditioned on the previous events.
            </p>
            <Card
                title="Chain Rule"
                body={
                    <p>
                        The chain rule states that if <T>{"\\{A_1, A_2, \\dots, A_n\\}"}</T> are events, then
                    </p>
                }
                formula={"P(A_1 \\cap A_2 \\cap \\dots \\cap A_n) = P(A_1) P(A_2 \\mid A_1) P(A_3 \\mid A_1 \\cap A_2) \\dots \\\\ P(A_n \\mid A_1 \\cap A_2 \\cap \\dots \\cap A_{n-1})"}
            />
            <p>
                Now that we've set up a precise mathematical framework for probability, we can move on to the notion of probability distributions, something that will be very important for modeling data.
            </p>
            <h2 id="probability-distributions">Probability Distributions</h2>
            <p>
                Before we understand the notion of probability distributions, we need to introduce random variables.
            </p>
            <h3 id="random-variables">Random Variables</h3>
            <p>
                A random variable is essentially a variable whose possible values are outcomes of a random phenomenon. It's a way to map outcomes of random processes (like rolling a die) to numbers.
            </p>
            <p>
                In the case of a 6-sided die, we could define the random variable, <T>{"X"}</T>, as the outcome of a die roll. Thus, <T>{"X"}</T> could be any integer from 1 to 6. This way, we can describe the event of rolling a 1 as <T>{"\\{X = 1\\}"}</T>. Similarly, the event of rolling any number can be described as follows <T>{"\\{X = 1, X = 2, X = 3, X = 4, X = 5, X = 6\\}"}</T>. Thus, <T>{"P(\\text{rolling a 3}) = P(\\{X = 3\\})"}</T> for example. An arbitrary random outcome is denoted by <T>{"x"}</T>, and the probability of that outcome is denoted by <T>{"P(X = x)"}</T>. The notation is usually further shortened to <T>{"P(x)"}</T> when the random variable is clear from context, which has been the case in most of our examples.
            </p>
            <h3 id="distributions">Distributions</h3>
            <p>
                The distribution of probabilities across all possible values of a random variable is what we call a probability distribution. In the case of our fair, six-sided die, the probability distribution is uniform, meaning that all outcomes are equally likely (at <T>{"\\frac{1}{6}"}</T>). Note that the distribution for a six-sided die is an example of a probability distribution for a discrete random variable (for example, we can’t have any fractional value between 1 and 2). We’ll see in the following section that there can also be probability distributions for continuous random variables.
            </p>
            <UniformDist id="uniform-dist1" />
            <p>
                It’s important to note that the area under the graph should always add up to one, and not more than that, since that represents <T>{"P(\\Omega)"}</T>, the probability of the entire sample space (getting any number on the die).
            </p>
            <p>
                There are several ways to describe probability distributions. What we’ll focus on here are the following:
            </p>
            <ul>
                <li>
                    <strong>Mean (Expected Value) <T>{"\\mathrm{E}[X]"}</T>:</strong> This is the average outcome of a large number of experiments (like rolling a die many times). In other words, if you were to repeat an experiment many times, the expected value is what you'd expect the average outcome to be.
                    <T displayMode="true">{"\\mathrm{E}[X] = \\mu_X = \\sum_{i=1}^{n} x_i P(x_i)"}</T>
                </li>
                <li>
                    <strong>Variance <T>{"\\mathrm{Var}[X]"}</T> and Standard Deviation <T>{"\\sigma_X"}</T>:</strong> These are measures of how spread out the values of your distribution are around the mean. The variance is the average squared distance from the mean. The standard deviation is the square root of the variance (and thus has the same unit as the mean).
                    <T displayMode="true">{`\\begin{align*}
                        \\mathrm{Var}[X] = \\sigma_X^2 &= \\sum_{i=1}^{n} (x_i - \\mu_X)^2 P(x_i) = \\mathrm{E}[(X - \\mu_X)^2] \\\\
                                            \\sigma_X &= \\sqrt{\\mathrm{Var}[X]}
                    \\end{align*}`}</T>

                </li>
            </ul>
            <p>
                In the case of our 6-sided die example, the mean is <T>3.5</T> and the standard deviation is <T>1.71</T>.
            </p>
            <h3 id="gaussian-distribution">The Gaussian Distribution</h3>
            <p>
                The Gaussian distribution (also known as the normal distribution) is a type of continuous probability distribution for real-valued random variables.
            </p>
            <GaussianDist />
            <ul>
                <li>
                    <strong>Shape:</strong> It is symmetric and bell-shaped. As can be seen from the figure, its peak lies in its mean, and the spread (or width) is described by its standard deviation. The Gaussian distribution is completely parametrized by its mean and standard deviation.
                </li>
                <li>
                    <strong>Area under the curve:</strong> For a continuous probability distribution, we can only get probabilities of "intervals". This is because it is technically probability <T>0</T> to get a specific point in the distribution, since there are infinitely many possible single points. Hence, the area under the curve between two points gives us the probability of the random variable lying in that range. For example, the probability of the random variable lying between -1 and 1 can be calculated as:
                    {/* <T>{"P(-1 \\leq X \\leq 1) = \\text{area under the curve from -1 to 1} = 0.68"}</T> */}
                    <p class="text-center"><T>{"P(-1 \\leq X \\leq 1) = "}</T> area under the curve from <T>-1</T> to <T>1</T> <T>{" = 0.68"}</T></p>
                </li>
            </ul>
            <p>
                More generally, the probability of a continuous random variable lying in an interval can be calculated using the integral of the probability density function (PDF) over that interval:
            </p>
            <T displayMode="true">{"P(a \\leq X \\leq b) = \\int_a^b p(x) \\, dx"}</T>
            <p>
                Where <i>p</i> represents the probability density function of the distribution. For a normal distribution, the probability density function is defined as follows:
            </p>
            <T displayMode="true">{"p(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{1}{2}\\left(\\frac{x - \\mu}{\\sigma}\\right)^2}"}</T>
            <h2 id="sampling">Sampling From a Distribution</h2>
            <p>
                We can also sample points from a distribution. When doing so, we’re essentially generating random outcomes according to the distribution we're sampling from. That means an outcome with a higher probability (as defined by the distribution) is more likely to be generated in the sample.
            </p>
            <p>
                For instance, if you sample from a Gaussian distribution, you're most likely to get values close to the mean (the peak of the bell curve), while values farther from the mean (at the tails of the curve) are less likely to appear in the sample. The notation used to indicate that we're sampling a value <T>x</T> from a Gaussian distribution is as follows:
            </p>
            <T displayMode="true">
                {"x \\sim \\mathcal{N}(\\mu, \\sigma^2)"}
            </T>
            <p>
                One way to sample from an arbitrary Gaussian distribution is to first sample from a unit Gaussian <T>{"\\epsilon \\sim \\mathcal{N}(0, 1)"}</T>, and then transform that <T>{"\\epsilon"}</T> by the mean and standard deviation of the original distribution: <T>{"x = \\sigma \\cdot \\epsilon + \\mu"}</T>. This technique is known as the reparameterization trick and is useful in the context of training a model since it separates the randomness component from the transformation component, which is essential for backpropagation.
            </p>
            <h3 id="multivariate-gauss">Multivariate Gaussian Distributions</h3>
            <p>
                Transitioning from a single variable Gaussian distribution, we can extend the concept to involve multiple variables. In this case, instead of one random variable, we have a collection of random variables - a random vector. Let's denote this vector by <T>{"\\mathrm{X} = (X_1, X_2, …, X_k)^\\mathrm{T}"}</T>, where <T>{"\\mathrm{T}"}</T> stands for transpose, making the row vector a column one. This vector of variables is then sampled from a multivariate Gaussian distribution denoted as <T>{"\\mathcal{N}(\\mu, \\Sigma)"}</T>.
            </p>
            <p><T displayMode="true">{"\\mathrm{X} = \\begin{bmatrix} X_1 \\\\ X_2 \\\\ \\vdots \\\\ X_k \\end{bmatrix} \\sim \\mathcal{N}(\\mu, \\Sigma)"}</T></p>
            <p>
                Let's break down these elements:
            </p>
            <ul>
                <li>
                    <strong>
                        <T>{"\\mu = (\\mu_1, \\mu_2, …, \\mu_k)^\\mathrm{T} = \\mathrm{E}[\\mathrm{X}] = (\\mathrm{E}[X_1], \\mathrm{E}[X_2], …, \\mathrm{E}[X_k])^\\mathrm{T}"}</T>
                    </strong> is the mean vector. It is the multivariate equivalent of the mean <T>{"\\mu"}</T> in the univariate Gaussian distribution. Each element of this vector represents the average value you would expect to get for that variable.
                </li>
                <li>
                    <strong><T>{"\\Sigma"}</T></strong> represents a <T>{"k \\times k"}</T> covariance matrix, which is a generalization of variance to multiple dimensions.
                    <T displayMode="true">{`\\begin{align*}
            \\Sigma &= \\begin{bmatrix}
            \\mathrm{Var}[X_1] & \\mathrm{Cov}[X_1, X_2] & \\cdots & \\mathrm{Cov}[X_1, X_k] \\\\
            \\mathrm{Cov}[X_2, X_1] & \\mathrm{Var}[X_2] & \\cdots & \\mathrm{Cov}[X_2, X_k] \\\\
            \\vdots  & \\vdots  & \\ddots & \\vdots  \\\\
            \\mathrm{Cov}[X_k, X_1] & \\mathrm{Cov}[X_k, X_2] & \\cdots & \\mathrm{Var}[X_k] \\\\
            \\end{bmatrix}
            \\end{align*}`}</T>
                    Covariance is a statistical measure that tells us the degree to which two variables move in tandem. In other words, it provides insight into how two variables are related to each other. Therefore, each element in the covariance matrix, <T>{"\\mathrm{Cov}[X_i, X_j]"}</T>, represents the covariance between two random variables <T>{"X_i"}</T> and <T>{"X_j"}</T> in our random vector <T>{"\\mathrm{X}"}</T>.
                </li>
            </ul>
            <p>
                The presence of covariance in this matrix implies that the relationships between pairs of variables are considered, which is a feature not present in the single variable case. This means the distribution isn't required to be symmetrical with respect to any particular axis, such as the <T>x</T> or <T>y</T> axis in a two-dimensional distribution. You can explore this concept further with the following interactive illustration which shows how a sample of many points in a two-variable Gaussian distribution changes as we modify the covariance matrix.
            </p>
            <MultivariateGaussDist />
            <p>
                Tying this back to diffusion models, let's consider sampling a <T>{"512 \\times 512"}</T> RGB noise image from a Gaussian distribution. In this case, we'd be dealing with a <T>{"512 \\times 512 \\times 3 = 786432"}</T> dimensional distribution, due to the three RGB channels in each pixel. This would require a covariance matrix with a whopping <T>{"786432 \\times 786432 = 618475290624"}</T> entries. This size can pose significant computational challenges. To simplify the process, we often assume that there's no correlation between pixels or individual RGB values and that their variances are the same. This assumption allows us to use a much simpler covariance matrix, as demonstrated below:
            </p>
            <T displayMode="true">{`
                    \\Sigma = \\begin{bmatrix}
                    \\beta & 0 & \\cdots & 0 \\\\
                    0 & \\beta & \\cdots & 0 \\\\
                    \\vdots  & \\vdots  & \\ddots & \\vdots  \\\\
                    0 & 0 & \\cdots & \\beta \\\\
                    \\end{bmatrix} = \\beta \\cdot \\begin{bmatrix}
                    1 & 0 & \\cdots & 0 \\\\
                    0 & 1 & \\cdots & 0 \\\\
                    \\vdots  & \\vdots  & \\ddots & \\vdots  \\\\
                    0 & 0 & \\cdots & 1 \\\\
                    \\end{bmatrix} = \\beta \\cdot \\mathbf{I}
                `}</T>
            <h3 id="kl-divergence">Distance between Two Distributions (Kullback-Leibler Divergence)</h3>
            <p>
                One last new concept we need to understand is how we measure the distance between two distributions. This is important because sometimes we want to enforce that our approximated distribution matches a specific type of distribution, and having a measure of how far our result is from the target is certainly useful.
            </p>
            <p>
                Let's first outline the characteristics we desire in a good measure of distance <T>{"D(P||Q)"}</T>:
            </p>
            <ol>
                <li><strong>Asymmetric</strong>: We want the measure to be sensitive to the direction of comparison. That is, comparing distribution Q with P should yield a different value than comparing P with Q. <i>Note that this is why we use the || in the notation - to indicate that the measure is asymmetric.</i>
                </li>
                <li><strong>Equal Weight</strong>: Our measure should give equal magnitude but opposite signs for the same relative differences in opposite directions.</li>
                <li><strong>Sensitivity to Frequency</strong>: The measure should weigh more frequently occurring outcomes more heavily in the calculation of the total distance.</li>
            </ol>
            <p>
                With these characteristics in mind, let's proceed.
            </p>
            <p>
                Let’s go back to our example of a 6-sided die. If the die is fair, then we would expect the probability distribution to look like this:
            </p>
            <UniformDist />
            <p>
                This is what we’ll call our theoretical distribution, <T>{"Q"}</T>. Thus, <T>{"Q(X=1) = \\frac{1}{6}"}</T>, for example.
            </p>
            <p>
                However, let’s say we rolled the die many times over, and we got the following probability distribution instead.
            </p>
            <NonUnifDist />
            <p>
                As we can see, the die is clearly not fair, with values like 6 given significantly more weight than other values.
            </p>
            <p>
                We’ll call this our measured probability distribution, <T>{"P"}</T>. Thus, <T>{"P(X=2) = \\frac{1}{12}"}</T>, for example.
            </p>
            <p>
                Our goal is to find a way to get a number representing the relative distance from <T>{"Q"}</T> to <T>{"P"}</T>.
            </p>
            <p>
                We could start by calculating the relative difference for the probability of each random variable across the two distributions.
            </p>
            <T displayMode="true">{"D(P||Q) = \\sum_x \\frac{P(x)}{Q(x)}"}</T>
            <p>
                For example, for <T>{"X=5"}</T>, the contribution to the total distance could be something like <T>{"\\frac{P(X = 6)}{Q(X = 6)}=\\frac{\\frac{1}{3}}{\\frac{1}{6}}=2"}</T>. Notice that we put <T>{"Q"}</T> at the denominator because we want to see how different <T>{"P"}</T> is relative to <T>Q</T>, our reference distribution. Similarly, for <T>{"X=2"}</T>, the contribution would be <T>{"\\frac{P(X = 2)}{Q(X = 2)}=\\frac{\\frac{1}{12}}{\\frac{1}{6}}=\\frac{1}{2}"}</T>. However, we immediately notice an issue here. Visually, we can see that the contribution of the distance at <T>{"X=1"}</T> should be equal in magnitude to that at <T>X=6</T>, but opposite in sign. If we just took the ratio <T>{"\\frac{P}{Q}"}</T>, we would seemingly give less weight to parts where <T>{"P"}</T> is less than <T>{"Q"}</T>, which doesn’t seem ideal. Therefore, a convenient way to ensure that <T>{"\\frac{P(X = 2)}{Q(X = 2)}"}</T> is given the same magnitude but opposite sign to <T>{"\\frac{P(X = 5)}{Q(X = 5)}"}</T> is to pass it to the logarithm function.
            </p>
            <T displayMode="true">{"D(P||Q) = \\sum_{x}\\log_2 \\left(\\frac{P(x)}{Q(x)}\\right)"}</T>
            <p>
                Now <T>{"\\frac{P(X = 2)}{Q(X = 2)} = \\frac{1}{2}"}</T> becomes <T>{"\\log_2 \\left(\\frac{P(X = 2)}{Q(X = 2)}\\right) = \\log_2{(\\frac{1}{2})} = -1"}</T>, which is equal in magnitude but opposite in sign to <T>{"\\log_2 \\left(\\frac{P(X = 6)}{Q(X = 6)}\\right) = \\log_2{(2)} = 1"}</T>.
            </p>
            <p>
                It's worth noting that in the context of machine learning, the base doesn't really matter since it just adds a certain scaling factor to the result. For convenience, we'll just use base <T>e</T> (natural log) for the rest of this article.
            </p>
            <p>
                Phew, now that that’s fixed, are we done? Well, we still don't have sensitivity to frequency.
                Here are the probability distributions, <T>Q</T> and <T>P</T>, again.
            </p>
            <div className="grid grid-cols-2 gap-4">
                <div class="text-center">
                    <T>{"Q"}</T>
                    <UniformDist />
                </div>
                <div class="text-center">
                    <T>{"P"}</T>
                    <NonUnifDist />
                </div>
            </div>
            <p>
                Notice that for the <T>{"P"}</T> distribution, <T>{"P(X=6)"}</T> is significantly higher than the rest (peak). This means that <T>{"X=6"}</T> will occur more frequently than other values, and we might want to give it more weight in our measure of distance. One way to do this is to multiply our logarithm by the probability of <T>P</T> at that value, which modifies the formula to the following.
            </p>
            <T displayMode="true">{"D(P||Q) = \\sum_{x}P(x)\\log \\left(\\frac{P(x)}{Q(x)}\\right)"}</T>
            <p>
                This is our final formula. What we’ve just arrived at is what’s called the KL-Divergence (also known as relative entropy) of <T>{"Q"}</T> from <T>{"P"}</T>. The way we’ve introduced KL-Divergence is from a completely convenience perspective, but there are other ways to interpret it that involve information theory. However, since this is outside the scope of this blog post, I’ll just leave it to the curious reader to explore this further.
            </p>
            <p>
                We can also expand this to continuous distributions with probability density functions. The formula is the following.
            </p>
            <T displayMode="true">{"D_{KL}(P||Q) = \\int_{x}p(x)\\log \\left(\\frac{p(x)}{q(x)}\\right)dx"}</T>
            <p>One of the benefits of using gaussian distributions is that the KL-Divergence between two gaussian has a closed form solution, which is very convenient for us.</p>
            <p>You can play around with the two gaussian distributions below to see how the KL-Divergence changes.</p>
            <KLDiv />
            <p>
                Now that we've covered up a lot of the background, let's get back to diffusion models. See you in the next post!
            </p>
        </article >
        <footer>
            <div class="h-80"></div>
        </footer>
    </>
}

function UniformDist() {
    const data = [
        { x: 1, y: 1 / 6 },
        { x: 2, y: 1 / 6 },
        { x: 3, y: 1 / 6 },
        { x: 4, y: 1 / 6 },
        { x: 5, y: 1 / 6 },
        { x: 6, y: 1 / 6 },
    ]

    let div;
    onMount(() => {
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = div.clientWidth - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const graph = d3.select(div);

        const chart = graph
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => d.x))
            .range([0, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, 0.40])
            .range([height, 0]);


        chart.selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => x(d.x))
            .attr("class", "fill-current text-[#eab308] hover:text-[#ca8a04]")
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.y))
            .attr("y", d => y(d.y))
            .attr("stroke", "black")
            .attr("stroke-width", 2.5)

        const xAxis = d3.axisBottom(x);
        xAxis(
            chart.append("g")
                .attr("transform", `translate(0, ${height})`)
                .attr("stroke-width", 1.5)
        );

        const yAxis = d3.axisLeft(y);
        yAxis(
            chart.append("g")
                .attr("stroke-width", 1.5)
        );

        // increase the font size of the axis
        chart.selectAll(".tick text")
            .attr("font-size", "12px")
            .attr("font-family", "Fira Code")
            .attr("stroke", "black")
            .attr("stroke-width", 0.5);
    });

    return (
        <div ref={div}></ div>
    );
}

function NonUnifDist() {
    const data = [
        { x: 1, y: 1 / 6 },
        { x: 2, y: 1 / 12 },
        { x: 3, y: 0.10 },
        { x: 4, y: 0.15 },
        { x: 5, y: 1 / 6 },
        { x: 6, y: 1 / 3 },
    ]

    let div;
    onMount(() => {
        const graph = d3.select(div);
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = div.clientWidth - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const chart = graph
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => d.x))
            .range([0, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, 0.40])
            .range([height, 0]);

        chart.selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => x(d.x))
            .attr("class", "fill-current text-[#eab308] hover:text-[#ca8a04]")
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.y))
            .attr("y", d => y(d.y))
            .attr("stroke", "black")
            .attr("stroke-width", 2.5)

        const xAxis = d3.axisBottom(x);
        xAxis(
            chart.append("g")
                .attr("transform", `translate(0, ${height})`)
                .attr("stroke-width", 1.5)
        );

        const yAxis = d3.axisLeft(y);
        yAxis(
            chart.append("g")
                .attr("stroke-width", 1.5)
        );

        // increase the font size of the axis
        chart.selectAll(".tick text")
            .attr("font-size", "12px")
            .attr("font-family", "Fira Code")
            .attr("stroke", "black")
            .attr("stroke-width", 0.5);
    });

    return (
        <div ref={div}></div>
    );
}

function normalPDF(x, mean, std) {
    const m = std * Math.sqrt(2 * Math.PI);
    const e = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(std, 2)));
    return e / m;
}

function GaussianDist() {
    const sliderMean = new Slider(<T>{"\\mu"}</T>, -5, 5, 0.1, 0);
    const sliderStd = new Slider(<T>{"\\sigma"}</T>, 0, 10, 0.1, 1);

    let gaussDiv, graph, width, height, margin;

    onMount(() => {
        graph = d3.select(gaussDiv);
        margin = { top: 20, right: 20, bottom: 30, left: 40 };
        width = gaussDiv.clientWidth - margin.left - margin.right;
        height = 450 - margin.top - margin.bottom;
    });

    createEffect(() => {
        const mean = sliderMean.value();
        const std = sliderStd.value();

        graph.selectAll("*").remove();

        const chart = graph
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const xScale = d3.scaleLinear().domain([-5, 5]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, 0.5]).range([height, 0]);

        const xs = d3.range(-5, 5, 0.01).map(x => xScale(x));
        const ys = xs.map(x => yScale(normalPDF(xScale.invert(x), mean, std)));

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        xAxis(chart
            .append("g")
            .attr("transform", `translate(0, ${height})`)
        );

        yAxis(
            chart.append("g")
        );

        // increase the font size of the axis
        chart.selectAll(".tick text")
            .attr("font-size", "12px")
            .attr("font-family", "Fira Code")
            .attr("stroke", "black")
            .attr("stroke-width", "0.5px");

        const area = d3.area()
            .curve(d3.curveBasis)
            .y0(height)

        chart.append("path")
            .attr("d", area(d3.zip(xs, ys)))
            .attr("stroke", "black")
            .attr("stroke-width", 2.5)
            .attr("fill", "#f1c232ff")
            .attr("class", "fill-current text-[#f1c232ff] hover:text-[#ffd966ff]");
    });

    return (
        <>
            <div ref={gaussDiv}></div>
            <div class="grid grid-cols-2 gap-16">
                {sliderMean.render()}
                {sliderStd.render()}
            </div>
        </>
    );
}

class Matrix {
    constructor(initalMatrix) {
        [this.matrix, this.setMatrix] = createSignal(initalMatrix);
    }

    render() {
        return (
            <div>
                <table class="table-fixed w-full">
                    {this.matrix()._data.map((row, i) => (
                        <tr>
                            {row.map((value, j) => (
                                <td class="w-1/3 h-14 text-center text-lg bg-slate-200 border-sky-950 border-2">
                                    {value.toFixed(2)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </table>
            </div>
        )
    }
}

function MultivariateGaussDist() {
    const [eigenvalues, setEigenValues] = createSignal(math.matrix([2, 1]));
    const [eigenvectors, setEigenVectors] = createSignal(math.matrix([
        [1 / math.sqrt(2), 1 / math.sqrt(2)],
        [1 / math.sqrt(2), -1 / math.sqrt(2)]
    ]));

    function getCovFromEig(eigenvalues, eigenvectors) {
        const Lambda = math.diag(eigenvalues);
        const Q = eigenvectors;
        // we use the fact that Q is orthogonal, i.e. Q^T = Q^{-1}
        return math.multiply(math.multiply(Q, Lambda), math.transpose(Q));
    }

    const E = new Matrix(
        getCovFromEig(eigenvalues(), eigenvectors())
    );

    const means = new Matrix(math.matrix(
        [
            [0],
            [0],
        ]
    ));

    const num_points = 1000;
    const randomNormal = d3.randomNormal(0, 1);
    const randomUnitDiagonal = math.matrix(Array.from({ length: num_points }, () => [randomNormal(), randomNormal()]));

    let ref, graph, width, height, margin, xScale, yScale, xAxis, yAxis;

    // drag behavior for means, x and y should be relative to the parent
    const dragMean = d3.drag()
        .on("drag", function ({ sourceEvent }) {
            const x = sourceEvent.offsetX;
            const y = sourceEvent.offsetY;

            d3.select(this)
                .attr("cx", x)
                .attr("cy", y);

            means.setMatrix(math.matrix([
                [xScale.invert(x)],
                [yScale.invert(y)],
            ]));
        });

    // drag behavior for first eigenvector
    const dragEig1 = d3.drag()
        .on("drag", function ({ sourceEvent }) {
            const x = sourceEvent.offsetX;
            const y = sourceEvent.offsetY;

            d3.select(this)
                .attr("cx", x)
                .attr("cy", y);

            let newEigenVector = math.matrix([
                xScale.invert(x) - means.matrix().get([0, 0]),
                yScale.invert(y) - means.matrix().get([1, 0]),
            ])
            const eigenValue = math.norm(newEigenVector);
            newEigenVector = math.divide(newEigenVector, eigenValue);

            // we use the fact that the two eigenvectors are orthogonal, 
            // and we'll define the second one as being clockwise to the first one
            const newOtherEigenVector = math.matrix([newEigenVector._data[1], -newEigenVector._data[0]])

            // update the eigenvectors
            setEigenVectors(math.matrix([newEigenVector._data, newOtherEigenVector._data]));
            setEigenValues(math.matrix([eigenValue, eigenvalues().get([1])]));

            // update the covariance matrix
            E.setMatrix(getCovFromEig(eigenvalues(), eigenvectors()));
        });

    // drag behavior for second eigenvector
    const dragEig2 = d3.drag()
        .on("drag", function ({ sourceEvent }) {
            const x = sourceEvent.offsetX;
            const y = sourceEvent.offsetY;

            d3.select(this)
                .attr("cx", x)
                .attr("cy", y);

            let newEigenVector = math.matrix([
                xScale.invert(x) - means.matrix().get([0, 0]),
                yScale.invert(y) - means.matrix().get([1, 0]),
            ])
            const eigenValue = math.norm(newEigenVector);
            newEigenVector = math.divide(newEigenVector, eigenValue);

            // we use the fact that the two eigenvectors are orthogonal, 
            // and we'll define the second one as being clockwise to the first one
            const newOtherEigenVector = math.matrix([-newEigenVector._data[1], newEigenVector._data[0]])

            // update the eigenvectors
            setEigenVectors(math.matrix([newOtherEigenVector._data, newEigenVector._data]));
            setEigenValues(math.matrix([eigenvalues().get([0]), eigenValue]));

            // update the covariance matrix
            E.setMatrix(getCovFromEig(eigenvalues(), eigenvectors()));
        });


    onMount(() => {
        graph = d3.select(ref);
        margin = { top: 20, right: 20, bottom: 20, left: 20 };
        width = ref.clientWidth - margin.left - margin.right;
        height = width - margin.top - margin.bottom;

        xScale = d3.scaleLinear().domain([-5, 5]).range([0, width]);
        yScale = d3.scaleLinear().domain([-5, 5]).range([height, 0]);

        xAxis = d3.axisBottom(xScale);
        yAxis = d3.axisLeft(yScale);
    });

    createEffect(() => {
        const Lambda_sqrt = math.diag(eigenvalues().map(value => math.sqrt(value)));
        const T = math.multiply(eigenvectors(), Lambda_sqrt);
        const randomPoints = math.add(math.multiply(randomUnitDiagonal, math.transpose(T)), math.transpose(means.matrix()));

        graph.selectAll("*").remove();

        const chart = graph
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

        xAxis(chart
            .append("g")
            .attr("transform", `translate(0, ${height / 2})`)
            .attr("stroke-width", 1.5)
        );

        yAxis(
            chart.append("g")
                .attr("transform", `translate(${width / 2}, 0)`)
                .attr("stroke-width", 1.5)
        );

        // increase the font size of the axis
        chart.selectAll(".tick text")
            .attr("font-size", "12px")
            .attr("font-family", "Fira Code")
            .attr("stroke", "black")
            .attr("stroke-width", 0.5);

        // scatter plot
        chart.selectAll("circle")
            .data(randomPoints._data)
            .join("circle")
            .attr("cx", d => xScale(d[0]))
            .attr("cy", d => yScale(d[1]))
            .attr("r", 1.5)
            .attr("fill", "darkgreen")

        // draw eigen vectors
        const eigenVectors = eigenvectors()._data;
        const eigenValues = eigenvalues()._data;

        const x = means.matrix().get([0, 0]);
        const y = means.matrix().get([1, 0]);

        // defining the arrow head
        chart
            .append("defs")
            .selectAll("marker")
            .data(["arrow"])
            .enter().append("marker")
            .attr("id", d => d)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 5)
            .attr("refY", 0)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#ca8a04");

        // first eigen vector
        chart
            .append("line")
            .attr("x1", xScale(x))
            .attr("y1", yScale(y))
            .attr("x2", xScale(eigenVectors[0][0] * eigenValues[0] + x))
            .attr("y2", yScale(eigenVectors[1][0] * eigenValues[0] + y))
            .attr("stroke", "#ca8a04")
            .attr("stroke-width", 4)
            .attr("marker-end", "url(#arrow)")
            .call(dragEig1);

        // draggable circle on the first eigen vector
        chart
            .append("circle")
            .attr("cx", xScale(eigenVectors[0][0] * eigenValues[0] + x))
            .attr("cy", yScale(eigenVectors[1][0] * eigenValues[0] + y))
            .attr("r", 20)
            .style("fill", "transparent")
            .call(dragEig1);

        // second eigen vector
        chart
            .append("line")
            .attr("x1", xScale(x))
            .attr("y1", yScale(y))
            .attr("x2", xScale(eigenVectors[0][1] * eigenValues[1] + x))
            .attr("y2", yScale(eigenVectors[1][1] * eigenValues[1] + y))
            .attr("stroke", "#ca8a04")
            .attr("stroke-width", 4)
            .attr("marker-end", "url(#arrow)")
            .call(dragEig2);

        // draggable circle on the second eigen vector
        chart
            .append("circle")
            .attr("cx", xScale(eigenVectors[0][1] * eigenValues[1] + x))
            .attr("cy", yScale(eigenVectors[1][1] * eigenValues[1] + y))
            .attr("r", 20)
            .style("fill", "transparent")
            .call(dragEig2);

        // draw the mean and update based on the drag
        chart
            .append("circle")
            .attr("cx", xScale(x))
            .attr("cy", yScale(y))
            .attr("r", 5)
            .attr("fill", "darkred")
            .call(dragMean);

    });

    return (
        <div class="text-center">
            <div class="flex flex-row items-center">
                <div ref={ref} class="w-9/12"></div>
                <div class="flex flex-col w-2/12 text-center mr-2 justify-center">
                    <span class="text-xl"><T>{"\\Sigma"}</T></span>
                    {E.render()}
                </div>
                <div class="flex flex-col w-1/12 text-center ml-2 justify-center">
                    <span class="text-xl"><T>{"\\mu"}</T></span>
                    {means.render()}
                </div>
            </div>
        </div>
    )
}

function KLDiv() {
    const sliderMeanQ = new Slider(<T>{"\\mu_Q"}</T>, -5, 5, 0.1, -0.3);
    const sliderStdQ = new Slider(<T>{"\\sigma_Q"}</T>, 0, 10, 0.1, 1);

    const sliderMeanP = new Slider(<T>{"\\mu_P"}</T>, -5, 5, 0.1, 0.3);
    const sliderStdP = new Slider(<T>{"\\sigma_P"}</T>, 0, 10, 0.1, 1);

    function klDivergence(muP, sP, muQ, sQ) {
        const muDiff = muP - muQ;
        return Math.log(sQ / sP) + (sP * sP + muDiff * muDiff) / (2 * sQ * sQ) - 0.5;
    }

    const [divergence, setDivergence] = createSignal(
        klDivergence(sliderMeanP.value(), sliderStdP.value(), sliderMeanQ.value(), sliderStdQ.value())
    );

    let gaussDiv, graph, width, height, margin;

    onMount(() => {
        graph = d3.select(gaussDiv);
        margin = { top: 20, right: 20, bottom: 30, left: 40 };
        width = gaussDiv.clientWidth - margin.left - margin.right;
        height = 450 - margin.top - margin.bottom;
    });

    createEffect(() => {
        const meanQ = sliderMeanQ.value();
        const stdQ = sliderStdQ.value();

        const meanP = sliderMeanP.value();
        const stdP = sliderStdP.value();

        setDivergence(klDivergence(meanP, stdP, meanQ, stdQ));

        graph.selectAll("*").remove();

        const chart = graph
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const xScale = d3.scaleLinear().domain([-5, 5]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, 0.5]).range([height, 0]);

        const xs = d3.range(-5, 5, 0.01).map(x => xScale(x));
        const ys1 = xs.map(x => yScale(normalPDF(xScale.invert(x), meanQ, stdQ)));
        const ys2 = xs.map(x => yScale(normalPDF(xScale.invert(x), meanP, stdP)));

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        xAxis(chart
            .append("g")
            .attr("transform", `translate(0, ${height})`)
        );

        yAxis(
            chart.append("g")
        );

        // increase the font size of the axis
        chart.selectAll(".tick text")
            .attr("font-size", "12px")
            .attr("font-family", "Fira Code")
            .attr("stroke", "black")
            .attr("stroke-width", "0.5px");

        const area = d3.area()
            .curve(d3.curveBasis)
            .y0(height)

        chart.append("path")
            .attr("d", area(d3.zip(xs, ys1)))
            .attr("stroke", "black")
            .attr("stroke-width", 2.5)
            .attr("fill", "#f1c232ff")
            .attr("fill-opacity", 0.7)
            .attr("class", "fill-current text-[#f1c232ff] hover:text-[#ffd966ff]");

        chart.append("path")
            .attr("d", area(d3.zip(xs, ys2)))
            .attr("stroke", "black")
            .attr("stroke-width", 2.5)
            .attr("fill", "#f1c232ff")
            .attr("fill-opacity", 0.7)
            .attr("class", "fill-current text-[#f1c232ff] hover:text-[#ffd966ff]");

    });

    return (
        <>
            <div ref={gaussDiv}></div>
            <div class="grid grid-cols-3 gap-x-16 gap-y-4">
                <div class="text-center">
                    {sliderMeanQ.render()}
                    {sliderStdQ.render()}
                </div>
                <div class="text-center">
                    <span class="text-xl"><T>{"D_{KL}(P||Q)"}</T></span>
                    <br />
                    <span class="text-2xl">{divergence().toFixed(2)}</span>
                </div>
                <div class="text-center">
                    {sliderMeanP.render()}
                    {sliderStdP.render()}
                </div>
            </div>
        </>
    );

}