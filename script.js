// Seleção de elementos
const uploadInput = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const plantImages = document.querySelectorAll('.plant');
const downloadButton = document.getElementById('download');

// Variáveis para controle de edição
let uploadedImage = null;
let plants = []; // Lista para rastrear as plantas adicionadas
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

// Adicionar plantas ao canvas
plantImages.forEach((plantImg) => {
  plantImg.addEventListener('click', () => {
    const img = new Image();
    img.src = plantImg.src;
    img.onload = () => {
      // Calcular tamanho inicial da planta como 10% da largura da imagem de fundo
      const initialWidth = uploadedImage ? uploadedImage.width * 0.1 : 80;
      const initialHeight = (img.height / img.width) * initialWidth;

      const plant = {
        image: img,
        x: 50,
        y: 50,
        width: initialWidth, // Largura inicial baseada em 10%
        height: initialHeight, // Altura proporcional à largura
        isDragging: false,
        isResizing: false,
        showButtons: false
      };
      plants.push(plant);
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

  // Desenhar plantas
  plants.forEach((plant) => {
    ctx.drawImage(plant.image, plant.x, plant.y, plant.width, plant.height);

    if (plant.showButtons) {
      // Desenhar botão de remoção
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(plant.x + plant.width - 10, plant.y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText('X', plant.x + plant.width - 14, plant.y + 14);

      // Desenhar botão de redimensionamento
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.arc(plant.x + plant.width - 10, plant.y + plant.height - 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText('✎', plant.x + plant.width - 16, plant.y + plant.height - 6);
    }
  });
}

// Eventos de arrastar, redimensionar e remover plantas
let selectedPlant = null;
let offsetX, offsetY;
let isResizing = false;

canvas.addEventListener('mousedown', (event) => {
  const { offsetX: mouseX, offsetY: mouseY } = event;
  selectedPlant = plants.find(
    (plant) =>
      mouseX >= plant.x &&
      mouseX <= plant.x + plant.width &&
      mouseY >= plant.y &&
      mouseY <= plant.y + plant.height
  );

  if (selectedPlant) {
    selectedPlant.showButtons = true;

    // Verificar se clicou no botão de remoção
    const removeX = selectedPlant.x + selectedPlant.width - 10;
    const removeY = selectedPlant.y + 10;
    const distance = Math.sqrt(
      Math.pow(mouseX - removeX, 2) + Math.pow(mouseY - removeY, 2)
    );

    if (distance <= 10) {
      plants = plants.filter((plant) => plant !== selectedPlant);
      selectedPlant = null;
      drawCanvas();
      return;
    }

    // Verificar se clicou no botão de redimensionamento
    const resizeX = selectedPlant.x + selectedPlant.width - 10;
    const resizeY = selectedPlant.y + selectedPlant.height - 10;
    const resizeDistance = Math.sqrt(
      Math.pow(mouseX - resizeX, 2) + Math.pow(mouseY - resizeY, 2)
    );

    if (resizeDistance <= 10) {
      isResizing = true;
    } else {
      offsetX = mouseX - selectedPlant.x;
      offsetY = mouseY - selectedPlant.y;
      selectedPlant.isDragging = true;
    }
  } else {
    plants.forEach((plant) => (plant.showButtons = false));
  }

  drawCanvas();
});

canvas.addEventListener('mousemove', (event) => {
  if (selectedPlant) {
    const { offsetX: mouseX, offsetY: mouseY } = event;

    if (isResizing) {
      selectedPlant.width = Math.max(mouseX - selectedPlant.x, 20); // Largura mínima de 20px
      selectedPlant.height = Math.max(mouseY - selectedPlant.y, 20); // Altura mínima de 20px
    } else if (selectedPlant.isDragging) {
      selectedPlant.x = mouseX - offsetX;
      selectedPlant.y = mouseY - offsetY;
    }

    drawCanvas();
  }
});

canvas.addEventListener('mouseup', () => {
  if (selectedPlant) {
    selectedPlant.isDragging = false;
    isResizing = false;
    selectedPlant = null;
  }
});

canvas.addEventListener('mouseleave', () => {
  if (selectedPlant) {
    selectedPlant.isDragging = false;
    isResizing = false;
    selectedPlant = null;
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
