// Frontend Gas Relayer Helper (Server Authorization)
export const serverAuthorization = async (account: any) => {
  // Using the same Testnet Admin Address specified in our backend api
  const ADMIN_ADDRESS =
    process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "0x2515004a5408a7f0";
  const KEY_ID = 0;

  return {
    ...account,
    tempId: `${ADMIN_ADDRESS}-${KEY_ID}`,
    addr: ADMIN_ADDRESS.replace(/^0x/, ""),
    keyId: KEY_ID,
    signingFunction: async (signable: any) => {
      // Defer signing of this transaction to our secure backend Gas Relayer
      const response = await fetch("/api/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signable),
      });

      const { signature } = await response.json();

      return {
        addr: ADMIN_ADDRESS.replace(/^0x/, ""),
        keyId: KEY_ID,
        signature,
      };
    },
  };
};
