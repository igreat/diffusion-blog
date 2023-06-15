import { createSignal } from "solid-js";

export default class Slider {
    constructor(name, min, max, step, value) {
        this.name = name;
        this.min = min;
        this.max = max;
        this.step = step;
        [this.value, this.setValue] = createSignal(value);
    }

    render() {
        return (
            <div>
                <div class="relative !m-0 !p-0">
                    <input
                        type="range"
                        class="w-full bg-gray-200 rounded-full outline-none transition-colors focus:bg-blue-300"
                        id={this.name}
                        name={this.name}
                        min={this.min}
                        max={this.max}
                        step={this.step}
                        value={this.value()}
                        oninput={(e) => this.setValue(e.target.value)}
                        style={{
                            background:
                                `linear-gradient(
                                    to right, #60A5FA 0%, #60A5FA ${(this.value() - this.min) / (this.max - this.min) * 100}%, #E5E7EB ${(this.value() - this.min) / (this.max - this.min) * 100}%, #E5E7EB 100%
                                )`
                        }}
                    />
                    <div class="absolute top-0 right-0 flex items-center h-2 pl-2 text-xs text-gray-500 bg-white rounded-full shadow-sm" style={{ transform: `translateX(${(this.value() - this.min) / (this.max - this.min) * 100}%` }}>
                        {this.value()}
                    </div>
                </div>

                <div class="text-center !p-0">
                    <label class="text-xl text-gray-700" for={this.name}>
                        {this.name}
                    </label>
                    =
                    <output class="text-xl text-gray-70" for={this.name}>
                        {this.value()}
                    </output>
                </div>
            </div>
        );
    }
}
