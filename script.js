// Seleção de elementos
const uploadInput = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const itensImages = document.querySelectorAll('.item');
const downloadButton = document.getElementById('download');

// Variáveis para controle de edição
let uploadedImage = null;
let itens = []; // Lista para rastrear as itens adicionadas
let uploadedFileName = '';
const MAX_SIZE = 750;

// Configurações iniciais do canvas
canvas.width = 800;
canvas.height = 600;
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Função para redimensionar imagem
function resizeImage(img, maxSize) {
  const { width, height } = img;
  if (width > maxSize || height > maxSize) {
    const scale = Math.min(maxSize / width, maxSize / height);
    return {
      width: Math.floor(width * scale),
      height: Math.floor(height * scale)
    };
  }
  return { width, height };
}

// Carregar imagem de fundo no canvas
uploadInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadedFileName = file.name.split('.')[0]; // Pegar o nome do arquivo sem extensão
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const newSize = resizeImage(img, MAX_SIZE);
        canvas.width = newSize.width;
        canvas.height = newSize.height;
        ctx.drawImage(img, 0, 0, newSize.width, newSize.height);
        uploadedImage = img;
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

// Adicionar itens ao canvas
itensImages.forEach((itemImg) => {
  itemImg.addEventListener('click', () => {
    const img = new Image();
    img.src = itemImg.src;
    img.onload = () => {
      // Calcular tamanho inicial da itema como 10% da largura da imagem de fundo
      const initialWidth = uploadedImage ? uploadedImage.width * 0.1 : 80;
      const initialHeight = (img.height / img.width) * initialWidth;

      const item = {
        image: img,
        x: 50,
        y: 50,
        width: initialWidth, // Largura inicial baseada em 10%
        height: initialHeight, // Altura proporcional à largura
        isDragging: false,
        isResizing: false,
        showButtons: false
      };
      itens.push(item);
      drawCanvas();
    };
  });
});

// Desenhar o canvas
function drawCanvas() {
  // Limpar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redesenhar imagem de fundo
  if (uploadedImage) {
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
  }

  // Desenhar itens
  itens.forEach((item) => {
    ctx.drawImage(item.image, item.x, item.y, item.width, item.height);

    if (item.showButtons) {
      // Desenhar botão de remoção
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(item.x + item.width - 10, item.y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText('X', item.x + item.width - 14, item.y + 14);

      // Desenhar botão de redimensionamento
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.arc(item.x + item.width - 10, item.y + item.height - 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText('✎', item.x + item.width - 16, item.y + item.height - 6);
    }
  });
}

// Eventos de arrastar, redimensionar e remover itens
let selecteditem = null;
let offsetX, offsetY;
let isResizing = false;

canvas.addEventListener('mousedown', (event) => {
  const { offsetX: mouseX, offsetY: mouseY } = event;
  selecteditem = itens.find(
    (item) =>
      mouseX >= item.x &&
      mouseX <= item.x + item.width &&
      mouseY >= item.y &&
      mouseY <= item.y + item.height
  );

  if (selecteditem) {
    selecteditem.showButtons = true;

    // Verificar se clicou no botão de remoção
    const removeX = selecteditem.x + selecteditem.width - 10;
    const removeY = selecteditem.y + 10;
    const distance = Math.sqrt(
      Math.pow(mouseX - removeX, 2) + Math.pow(mouseY - removeY, 2)
    );

    if (distance <= 10) {
      itens = itens.filter((item) => item !== selecteditem);
      selecteditem = null;
      drawCanvas();
      return;
    }

    // Verificar se clicou no botão de redimensionamento
    const resizeX = selecteditem.x + selecteditem.width - 10;
    const resizeY = selecteditem.y + selecteditem.height - 10;
    const resizeDistance = Math.sqrt(
      Math.pow(mouseX - resizeX, 2) + Math.pow(mouseY - resizeY, 2)
    );

    if (resizeDistance <= 10) {
      isResizing = true;
    } else {
      offsetX = mouseX - selecteditem.x;
      offsetY = mouseY - selecteditem.y;
      selecteditem.isDragging = true;
    }
  } else {
    itens.forEach((item) => (item.showButtons = false));
  }

  drawCanvas();
});

canvas.addEventListener('mousemove', (event) => {
  if (selecteditem) {
    const { offsetX: mouseX, offsetY: mouseY } = event;

    if (isResizing) {
      selecteditem.width = Math.max(mouseX - selecteditem.x, 20); // Largura mínima de 20px
      selecteditem.height = Math.max(mouseY - selecteditem.y, 20); // Altura mínima de 20px
    } else if (selecteditem.isDragging) {
      selecteditem.x = mouseX - offsetX;
      selecteditem.y = mouseY - offsetY;
    }

    drawCanvas();
  }
});

canvas.addEventListener('mouseup', () => {
  if (selecteditem) {
    selecteditem.isDragging = false;
    isResizing = false;
    selecteditem = null;
  }
});

canvas.addEventListener('mouseleave', () => {
  if (selecteditem) {
    selecteditem.isDragging = false;
    isResizing = false;
    selecteditem = null;
  }
});

// Botão de download
downloadButton.addEventListener('click', () => {
  const link = document.createElement('a');
  const fileName = uploadedFileName ? `${uploadedFileName}_CasaVerde.png` : 'CasaVerde.png';
  link.download = fileName;
  link.href = canvas.toDataURL();
  link.click();
});
