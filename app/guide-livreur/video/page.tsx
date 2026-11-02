import type {Metadata} from 'next';
import PrestoVideoPlayer from './player';
export const metadata:Metadata={
 title:'فيديو تدريب سائق PRESTO | دليل عملي',
 description:'فيديو تدريب سائق PRESTO بدقة 1080p مع فصول تفاعلية لخطوات التوصيل والأرباح وBankily.'
};
export default function DriverVideoPage(){return <PrestoVideoPlayer/>;}
