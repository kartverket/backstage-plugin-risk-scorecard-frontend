
echo "Starting plugin setup. Make sure you have setup app-config.local.yaml and cloned kartverket.dev..."

# Save current working directory to return to it later
cwd=$(pwd)

read -p "Enter kartverket.dev path: " kartverket_dev_path
cp ./app-config.yaml $kartverket_dev_path/app-config.yaml
cp ./app-config.local.yaml $kartverket_dev_path/app-config.local.yaml
echo "app-config and app-config.local.yaml copied to $kartverket_dev_path"

yarn install

cd $kartverket_dev_path
yarn install 

echo "Plugin setup complete. Starting development server..."

yarn dev --link $cwd
