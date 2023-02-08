// inserir o bootstrap
// npm i bootstrap
import 'bootstrap/dist/css/bootstrap.css'
import buildClient from "../api/buildClient";
import Header from '../components/header';

// inserir o bootstrap de forma global
const AppComponent =  ({ Component, pageProps, currentUser }) => {
    return (
    <div>
        <Header currentUser={currentUser}/>
        <div className='container'>
          {/* enviar currentUser para todos os Components */}
          <Component currentUser={currentUser} {...pageProps}/>
        </div>
    </div>
    )
}

AppComponent.getInitialProps = async appContext => {
  // requisiçao para o axios criado em buildClient
    const client =  buildClient( appContext.ctx )
    const { data } = await client.get('/api/users/currentuser')
  
    let pageProps = {}
    if(appContext.Component.getInitialProps){
// para utilizar o getInitialProps de LandingPage e inserir dados do user em LandingPage
//AppComponent.ctx constem req e res, data.currentUser contem os dados do usuario, 
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser)
    }

  return {
    pageProps,
    currentUser:data.currentUser
  };//elemento que podera ser utilizado em LandingPage
}

export default AppComponent