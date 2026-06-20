const API=process.env.NEXT_PUBLIC_API_URL || 'https://demo.schoolsoft.online/api';
export async function api<T>(path:string, init?:RequestInit):Promise<T>{const r=await fetch(`${API}${path}`,{...init,headers:{...(init?.body instanceof FormData?{}:{'Content-Type':'application/json'}),...init?.headers},cache:'no-store'});if(!r.ok) throw new Error((await r.json().catch(()=>null))?.detail||'Request failed');return r.json()}
export const imageUrl=(value?:string)=>value||'';
