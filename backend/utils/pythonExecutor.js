const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Utility function to execute Python scripts
 * @param {string} scriptPath - Path to the Python script
 * @param {Array} args - Arguments to pass to the Python script
 * @param {Object} jsonData - JSON data to pass to the Python script (if any)
 * @returns {Promise<any>} - Promise that resolves to the parsed JSON output
 */
const executePythonScript = (scriptPath, args = [], jsonData = null) => {
  return new Promise((resolve, reject) => {
    // Check if Python script exists
    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`Python script not found: ${scriptPath}`));
    }

    console.log(`Executing Python script: ${scriptPath} with args: ${args.join(' ')}`);

    // Spawn the Python process
    const pythonProcess = spawn('python', [scriptPath, ...args]);

    pythonProcess.on('error', (spawnError) => { // ADD THIS BLOCK
      console.error('Failed to start Python subprocess. Spawn error:', spawnError);
      reject(new Error(`Failed to start Python subprocess: ${spawnError.message}`));
      return; // Important to prevent further processing
    });

    let dataString = '';
    let errorString = '';

    // Collect data from script
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
      console.log(`Python stdout: ${data.toString()}`); // ADD THIS
    });

    // Collect error data from script
    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
      console.error(`Python stderr: ${data.toString()}`); // ENSURE THIS IS PRESENT AND ACTIVE
    });

    // Handle process close
    pythonProcess.on('close', (code) => {
      console.log(`Python process closed with code ${code}`); // ADD THIS
      if (code !== 0) {
        console.error(`Python script error. Code: ${code}, Stderr: ${errorString}`); // ADD THIS
        return reject(new Error(`Python process exited with code ${code}: ${errorString}`));
      }

      try {
        console.log(`Attempting to parse Python output: "${dataString}"`); // ADD THIS
        // Try to parse the data as JSON
        const jsonResult = JSON.parse(dataString);
        resolve(jsonResult);
      } catch (error) {
        console.error('Error parsing Python output:', error);
        console.error('Raw output:', dataString);
        reject(new Error(`Failed to parse Python script output: ${error.message}`));
      }
    });

    // Send JSON data to the Python script if provided
    if (jsonData) {
      pythonProcess.stdin.write(JSON.stringify(jsonData));
      pythonProcess.stdin.end();
    }
  });
};

/**
 * Create a temporary file and return its path
 * @param {Object} data - Data to write to the file
 * @param {string} prefix - Prefix for the temporary file
 * @returns {string} - Path to the temporary file
 */
const createTempDataFile = (data, prefix = 'temp') => {
  const tempDir = path.join(__dirname, '..', 'temp');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Create a temporary file
  const tempFile = path.join(tempDir, `${prefix}-${Date.now()}.json`);
  fs.writeFileSync(tempFile, JSON.stringify(data));
  
  return tempFile;
};

/**
 * Delete a temporary file
 * @param {string} filePath - Path to the file to delete
 */
const deleteTempFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  executePythonScript,
  createTempDataFile,
  deleteTempFile
};
