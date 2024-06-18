import DashboardSkeleton from "@/app/ui/skeletons";

/**
 * 设置dashboard路由组文件夹，将page和loading放在这里则不会影响到其他子路由页面
 * @constructor
 */
export default function Loading() {
    // 在页面内容加载之前作为代替
    // return <div>Loading...</div>
    return <DashboardSkeleton/>
};