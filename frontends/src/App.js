// import logo from './logo.svg';
import './App.css';
import { Route,Routes,Navigate} from 'react-router-dom';
import Signup from './Components/Signup/Signup'
import Login from './Components/Login/Login'
import Main from'./Components/Main/Main'

function App() {
  const user = localStorage.getItem("token")
  return (
      <Routes>
        {user && <Route path='/' element={<Main/>}/>}
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/' element={<Navigate replace to ="/login"/>}/>
      </Routes>
  );
}

export default App;
