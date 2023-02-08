import Link from 'next/link'; 

const LandingPage = ({ currentUser,tickets }) => {
    const ticketList = tickets.map( (ticket) => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                {/* utilizar o id do ticket no link */}
                    <Link legacyBehavior href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                        <a className='nav-link'>view</a>
                    </Link>
                </td>
            </tr>
        )
    } )

    return <div>
        <h1>Tickets</h1>
        <table className="table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Link</th>
                </tr>
            </thead>
            <tbody>
                {ticketList}
            </tbody>
        </table>
    </div>
};

// inserir elementos como props em LandingPage, client da acesso aos serviços nos pods
LandingPage.getInitialProps = async  (context,client, currentUser)  => {
    const { data } = await client.get('/api/tickets')
  
    return { tickets:data };//elemento que podera ser utilizado em LandingPage 
}

  export default LandingPage;
