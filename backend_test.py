import requests
import sys
import json
from datetime import datetime

class KazandiranCarkAPITester:
    def __init__(self, base_url="https://spin-win-10.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status} - {name}")
        if details:
            print(f"   Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success and response.content:
                try:
                    response_data = response.json()
                    details += f", Response: {json.dumps(response_data, indent=2)[:200]}..."
                    self.log_test(name, success, details)
                    return success, response_data
                except:
                    pass
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Raw response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@test.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        test_user_data = {
            "name": "Test",
            "surname": "User",
            "email": f"testuser_{datetime.now().strftime('%H%M%S')}@test.com",
            "phone": "+905551234567",
            "telegram_username": "testuser123",
            "password": "testpass123"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        if success and 'token' in response:
            self.user_token = response['token']
            return True
        return False

    def test_get_sites(self):
        """Test getting sites"""
        success, response = self.run_test(
            "Get Sites",
            "GET",
            "sites",
            200
        )
        return success

    def test_get_prizes(self):
        """Test getting prizes"""
        success, response = self.run_test(
            "Get Prizes",
            "GET",
            "prizes",
            200
        )
        return success

    def test_admin_create_site(self):
        """Test admin site creation"""
        if not self.admin_token:
            self.log_test("Admin Create Site", False, "No admin token available")
            return False
            
        site_data = {
            "name": f"Test Site {datetime.now().strftime('%H%M%S')}"
        }
        
        success, response = self.run_test(
            "Admin Create Site",
            "POST",
            "admin/sites",
            200,
            data=site_data,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        return success

    def test_admin_create_prize(self):
        """Test admin prize creation"""
        if not self.admin_token:
            self.log_test("Admin Create Prize", False, "No admin token available")
            return False
            
        # First get sites to use one
        sites_success, sites_response = self.run_test(
            "Get Sites for Prize Creation",
            "GET",
            "sites",
            200
        )
        
        if not sites_success or not sites_response:
            self.log_test("Admin Create Prize", False, "No sites available")
            return False
            
        site_id = sites_response[0]['id'] if sites_response else None
        if not site_id:
            self.log_test("Admin Create Prize", False, "No site ID found")
            return False
            
        prize_data = {
            "name": f"Test Prize {datetime.now().strftime('%H%M%S')}",
            "site_id": site_id,
            "description": "Test prize description",
            "weight": 1
        }
        
        success, response = self.run_test(
            "Admin Create Prize",
            "POST",
            "admin/prizes",
            200,
            data=prize_data,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        return success

    def test_wheel_spin(self):
        """Test wheel spinning"""
        if not self.user_token:
            self.log_test("Wheel Spin", False, "No user token available")
            return False
            
        spin_data = {
            "site_username": "testuser123"
        }
        
        success, response = self.run_test(
            "Wheel Spin",
            "POST",
            "wheel/spin",
            200,
            data=spin_data,
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        return success

    def test_get_my_spins(self):
        """Test getting user's spins"""
        if not self.user_token:
            self.log_test("Get My Spins", False, "No user token available")
            return False
            
        success, response = self.run_test(
            "Get My Spins",
            "GET",
            "wheel/my-spins",
            200,
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        return success

    def test_admin_get_spins(self):
        """Test admin getting all spins"""
        if not self.admin_token:
            self.log_test("Admin Get All Spins", False, "No admin token available")
            return False
            
        success, response = self.run_test(
            "Admin Get All Spins",
            "GET",
            "admin/spins",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        return success

    def test_admin_grant_extra_spins(self):
        """Test admin granting extra spins"""
        if not self.admin_token:
            self.log_test("Admin Grant Extra Spins", False, "No admin token available")
            return False
            
        extra_spin_data = {
            "user_id": None,  # Grant to all users
            "spins": 2
        }
        
        success, response = self.run_test(
            "Admin Grant Extra Spins",
            "POST",
            "admin/extra-spins",
            200,
            data=extra_spin_data,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        return success

    def test_auth_me(self):
        """Test getting current user info"""
        if not self.user_token:
            self.log_test("Auth Me", False, "No user token available")
            return False
            
        success, response = self.run_test(
            "Auth Me",
            "GET",
            "auth/me",
            200,
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Kazandıran Çark API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)

        # Authentication tests
        print("\n📝 Authentication Tests:")
        self.test_admin_login()
        self.test_user_registration()
        self.test_auth_me()

        # Public endpoint tests
        print("\n🌐 Public Endpoint Tests:")
        self.test_get_sites()
        self.test_get_prizes()

        # Admin functionality tests
        print("\n👑 Admin Functionality Tests:")
        self.test_admin_create_site()
        self.test_admin_create_prize()
        self.test_admin_get_spins()
        self.test_admin_grant_extra_spins()

        # User functionality tests
        print("\n🎯 User Functionality Tests:")
        self.test_wheel_spin()
        self.test_get_my_spins()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed!")
            failed_tests = [r for r in self.test_results if not r['success']]
            print("\nFailed tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
            return 1

def main():
    tester = KazandiranCarkAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())