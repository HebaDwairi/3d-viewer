export const exportJson = (object : object) => {
  console.log(object);
  
  const fileName = "annotations.json";
  const data = new Blob([JSON.stringify(object)], { type: "text/json" });
  const jsonURL = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  document.body.appendChild(link);
  link.href = jsonURL;
  link.setAttribute("download", fileName);
  link.click();
  document.body.removeChild(link);
};