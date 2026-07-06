import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Upload from "./pages/Upload";
import Documents from "./pages/Documents";
import PdfViewer from "./pages/PdfViewer";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/search"
            element={<Search />}
          />

          <Route
            path="/upload"
            element={<Upload />}
          />

          <Route
            path="/documents"
            element={<Documents />}
          />

          <Route
            path="/viewer/:filename"
            element={<PdfViewer />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;