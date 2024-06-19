'use server';
// 服务器函数

import {z} from 'zod'
import {sql} from '@vercel/postgres'
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
// 表单验证（添加校验信息）
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        // 必须大于0
        .gt(0, {message: 'Please enter an amount greater than $0.'}),
    date: z.string(),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    })
})
const CreateInvoice = FormSchema.omit({id: true, date: true})

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

/**
 * 创建发票
 * @param prevState useFormState传递的状态
 * @param formData
 */
export async function createInvoice(prevState: State, formData: FormData) {
    // 提取formData数据（使用safeParse进行服务端校验）
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    })
    console.log('validatedFields = ', validatedFields)
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }
    const {customerId, amount, status} = validatedFields.data;
    // 金额转换为美分
    const amountInCents = amount * 100;
    // 创建新日期
    const date = new Date().toISOString().split('T')[0];
    // 将数据插入数据库
    try {
        await sql`insert into invoices (customer_id, amount, status, date)
                values (${customerId},${amountInCents},${status},${date})`;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.'
        }
    }
    // 重新验证路径并从服务端获取最新的数据
    revalidatePath('/dashboard/invoices')
    // 路由重定向
    redirect('/dashboard/invoices')
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({id: true, date: true});

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    console.log('update form = ', formData);
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
    } catch (error) {
        return {message: 'Database Error: Failed to Update Invoice.'};
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    // throw new Error('Failed to delete invoices')

    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return {message: 'Deleted Invoice.'};
    } catch (error) {
        return {message: 'Database Error: Failed to Delete Invoice.'};
    }
}

/**
 * 登陆验证方法
 * @param prevState
 * @param formData
 */
export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}