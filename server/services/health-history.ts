type HealthData={consentedAt:Date;restrictions:string;goals?:string;observations?:string};
export function healthHistoryData(data:HealthData,actorId:string){return {...data,actorId};}
