import React, { useState, useEffect } from 'react';
import { Identity } from "@semaphore-protocol/identity";

const IdentityComponent: React.FC = () => {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [seed, setSeed] = useState<string>('');

  useEffect(() => {
    // Retrieve the identity from local storage
    const storedIdentityJSON = localStorage.getItem('identity');
    if (storedIdentityJSON) {
      setIdentity(new Identity(storedIdentityJSON));
    }
  }, []);

  const createNewIdentity = () => {
    const newIdentity = new Identity();
    setIdentity(newIdentity);
    localStorage.setItem('identity', newIdentity.toString());
  };

  const createIdentityFromSeed = () => {
    const newIdentity = new Identity(seed);
    setIdentity(newIdentity);
    localStorage.setItem('identity', newIdentity.toString());
  };

  const clearIdentity = () => {
    localStorage.removeItem('identity');
    setIdentity(null);
  };

  const handleSeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSeed(event.target.value);
  };

  return (
    <div className="identity-container">
      <p className='explanation'> Identities are triplets of keys called `Trapdoor`, `Nullifier` and `Commitment`. The first two should be kept private while commitment can be publicly shared. In this example, an identity can be generated, stored and retrieved from browsers storage </p>
      {identity ? (
        <div className="identity-info">
          <p className='success-message'>Identity Loaded</p>
          <p>Trapdoor: <span className="identity-value">{identity.trapdoor.toString()}</span></p>
          <p>Nullifier: <span className="identity-value">{identity.nullifier.toString()}</span></p>
          <p>Commitment: <span className="identity-value">{identity.commitment.toString()}</span></p>
        </div>
      ) : (
        <p className="no-identity">No identity found. Generate one and it will be stored in browser storage</p>
      )}
      <div className="actions">
        <button className="btn" onClick={createNewIdentity}>Create New Identity</button>
        <div className="input-group">
          <input type="text" className="input-field" value={seed} onChange={handleSeedChange} placeholder="Enter secret seed" />
          <button className="btn" onClick={createIdentityFromSeed}>Create Identity From Seed</button>
        </div>
        <button className="btn clear-btn" onClick={clearIdentity}>Clear Identity</button>
      </div>
    </div>
  );
}

export default IdentityComponent;
