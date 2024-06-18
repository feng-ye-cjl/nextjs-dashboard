'use server';
// 服务器函数

import {z} from 'zod'
import {sql} from '@vercel/postgres'
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

// 表单验证
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    date: z.string(),
    status: z.enum(['pending', 'paid'])
})
const CreateInvoice = FormSchema.omit({id: true, date: true})

export async function createInvoice(formData: FormData) {
    // 提取formData数据
    const {customerId, amount, status} = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    })
    // 金额转换为美分
    const amountInCents = amount * 100;
    // 创建新日期
    const date = new Date().toISOString().split('T')[0];
    // 将数据插入数据库
    await sql`insert into invoices (customer_id, amount, status, date)
                values (${customerId},${amountInCents},${status},${date})`
    console.log('获取到的表单数据：', customerId, amountInCents, status, date);
    console.log(typeof amount);
    // 重新验证路径并从服务端获取最新的数据
    revalidatePath('/dashboard/invoices')
    // 路由重定向
    redirect('/dashboard/invoices')
}