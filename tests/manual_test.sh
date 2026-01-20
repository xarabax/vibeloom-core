#!/bin/bash
echo ">>> Testing /api/upload (Validation)"

# Test 1: Invalid File Type (JSON should fail)
echo "1. Uploading package.json (Should Fail)"
curl -v -X POST -F "file=@./package.json" http://localhost:3000/api/upload
echo -e "\n"

# Test 2: Valid File Type (Plain Text)
echo "dummy content for validation" > test_valid.txt
echo "2. Uploading test_valid.txt (Should Succeed)"
curl -v -X POST -F "file=@test_valid.txt" http://localhost:3000/api/upload
echo -e "\n"

echo ">>> Testing /api/analyze (Full Flow)"

# Test 3: Analyze Request
echo "3. Sending Analyze Request"
curl -v -X POST \
  -F "goal=Test Strategy Goal" \
  -F "files=@test_valid.txt" \
  http://localhost:3000/api/analyze
echo -e "\n"

# Cleanup
rm test_valid.txt
