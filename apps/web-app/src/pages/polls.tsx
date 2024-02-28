// pages/index.js
import React, { useEffect, useState } from 'react';
import LinksList from '../components/LinkList';

export interface Poll  {
    pollId: number, text: string
}

export default function Polls () { 
    const [polls, setPolls] = useState<Poll[]>([])

    const getPolls = async () => {
        fetch("/api/polls", {
           method: "GET",
           headers: { "Content-Type": "application/json" },
       })
       .then((resp) => resp.json())
        .then((response) => {
            console.info('fetch()', response);
            setPolls(response)
        });
   }

   useEffect(() => {
        if (polls.length === 0) {
         console.log('call')

            getPolls()
        } else {
         console.log(polls)

        }
    }, [])

    return (<div>
        <h1 className="text-3xl font-bold text-center mt-8">Polls</h1>
        <LinksList items={polls}/>
      </div>
  );
}


