import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import {fetchCustomers, fetchInvoiceById} from '@/app/lib/data';
import {notFound} from "next/navigation";

export default async function Page({params}: { params: { id: string } }) {
    // 发票id
    const id = params.id;
    // 获取发票，和客户信息
    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(id),
        fetchCustomers(),
    ]);
    console.log('invoice = ', invoice)
    // 404处理
    if (!invoice) {
        notFound()
    }
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    {label: 'Invoices', href: '/dashboard/invoices'},
                    {
                        label: 'Edit Invoice',
                        href: `/dashboard/invoices/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <Form invoice={invoice} customers={customers}/>
        </main>
    );
}