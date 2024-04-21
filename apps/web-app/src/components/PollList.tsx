// components/LinksList.js

import { FC } from "react";
import { Poll } from "../pages/demo/polls/index-old";

const LinksList:FC<{items:Poll[]}> = ({items}) => (
    <div className="container mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((el: any) => (
         <a key={el.pollId}  href={`/demo/polls/${el.pollId}?text=${encodeURIComponent(el.text)}`} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">

            <h1 className="text-xl font-bold text-gray-800">Poll {el.pollId}</h1>
            <p>{el.text}</p>
          </a>
        ))}
      </div>
    </div>
  );

export default LinksList;
