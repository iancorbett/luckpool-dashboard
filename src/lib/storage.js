export const loadWallet = () => localStorage.getItem("wallet") || "";
export const saveWallet = (w) => localStorage.setItem("wallet", w);
