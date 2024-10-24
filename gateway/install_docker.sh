# Mettez à jour les paquets
sudo apt-get update

# Installez les paquets nécessaires
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Ajoutez la clé GPG officielle de Docker
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Configurez le dépôt stable
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Mettez à jour les paquets et installez Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Ajoutez votre utilisateur au groupe docker pour éviter d'utiliser sudo
sudo usermod -aG docker $USER

# Activez et démarrez le service Docker
sudo systemctl enable docker
sudo systemctl start docker