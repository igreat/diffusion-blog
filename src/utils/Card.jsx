import T from "./Latex";

export default function Card(props) {
    return (
        <div class="bg-[#fffbeb] p-6 mb-6 border-4 border-black">
            <h2 class="font-bold text-xl mb-4 !mt-3">{props.title}</h2>
            <div class="text-lg mb-4">{props.body}</div>
            <div class="font-mono text-center">
                <T displayMode="true">{props.formula}</T>
            </div>
            {props.example && <div class="text-lg mt-4">{props.example}</div>}
        </div>
    );
}

