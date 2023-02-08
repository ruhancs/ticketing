import { useEffect,useState } from "react"
import Router from "next/router"
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../hooks/useRequest'

const OrderShow = ({ order, currenteUser }) => {
    const [timeLeft,setTimeLeft] = useState(0)
    const { doRequest,errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: (payment) => {
            Router.push('/orders')
        }
    })

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date()//tempo que order expira em ms
            setTimeLeft(Math.round(msLeft/1000))
        };

        findTimeLeft()// para nao precisar passar 1 segundo para mostrar o tempo
        const timerId = setInterval(findTimeLeft, 1000)

        return () => {
            clearInterval(timerId)// apos terminar o tempo para de contar
        }
    }, [order])// [order] para o aviso no log nao aparecer

    if(timeLeft < 0) {
        return <div>Order Expired</div>
    }

    return <div>
        Time left to pay: {timeLeft} seconds
        <StripeCheckout 
            token={({id}) => doRequest({ token:id })} // enviar o token recebido pelo stripe para o serviço payments
            stripeKey="pk_test_51MYp5BFeX3gzJFa9a2S1FeEc7zBv4ypOQgg1dCYKqDBxJe9TEiX0gVB8E2jeYJBHwASEekDGvYBDjikUAkZyavGb00M8LLrCCq"
            amount={order.ticket.price * 100}
            email={currenteUser.email}
        />
        {errors}
        </div>
}

OrderShow.getInitialProps = async (context,client) => {
    const { orderId } = context.query
    const { data } = await client.get(`/api/orders/${ orderId }`)

    return { order:data }
}

export default OrderShow