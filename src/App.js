import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes } from 'react-router-dom';
import CompareData from './component/compareData';
import ScanPair from './component/scanPair';

function App() {
    return (
        <Routes>
            <Route path="/compare/:id" element={<CompareData/>}/>
            <Route path="/compare" element={<CompareData/>}/>
            <Route path="/scan" element={<ScanPair/>}/>
        </Routes>
    )
}

export default App;
