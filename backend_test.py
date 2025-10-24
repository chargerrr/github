import requests
import sys
import json
from datetime import datetime

class KazandiranCarkAPITester:
    def __init__(self, base_url="https://vipspin-platform.preview.emergentagent.com/api"):
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
        
        # Check if vip_spins field is present
        if success and 'vip_spins' in response:
            self.log_test("Auth Me - VIP Spins Field", True, f"VIP spins: {response['vip_spins']}")
        elif success:
            self.log_test("Auth Me - VIP Spins Field", False, "vip_spins field missing from response")
            
        return success

    # VIP System Tests
    def test_get_vip_conditions_public(self):
        """Test getting public VIP conditions"""
        success, response = self.run_test(
            "Get VIP Conditions (Public)",
            "GET",
            "vip-conditions",
            200
        )
        return success

    def test_get_vip_conditions_admin(self):
        """Test getting all VIP conditions (admin)"""
        if not self.admin_token:
            self.log_test("Get VIP Conditions (Admin)", False, "No admin token available")
            return False
            
        success, response = self.run_test(
            "Get VIP Conditions (Admin)",
            "GET",
            "admin/vip-conditions",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        return success

    def test_create_vip_condition(self):
        """Test creating VIP condition"""
        if not self.admin_token:
            self.log_test("Create VIP Condition", False, "No admin token available")
            return False
            
        # First get sites to use one
        sites_success, sites_response = self.run_test(
            "Get Sites for VIP Condition",
            "GET",
            "sites",
            200
        )
        
        if not sites_success or not sites_response:
            self.log_test("Create VIP Condition", False, "No sites available")
            return False
            
        site_id = sites_response[0]['id'] if sites_response else None
        if not site_id:
            self.log_test("Create VIP Condition", False, "No site ID found")
            return False
            
        vip_condition_data = {
            "site_id": site_id,
            "condition_type": "deposit",
            "condition_value": "100 TL yatırım",
            "description": "100 TL yatırım yapan kullanıcılar VIP çark hakkı kazanır",
            "spins_granted": 3,
            "is_active": True
        }
        
        success, response = self.run_test(
            "Create VIP Condition",
            "POST",
            "admin/vip-conditions",
            200,
            data=vip_condition_data,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        if success and 'id' in response:
            self.created_vip_condition_id = response['id']
            
        return success

    def test_delete_vip_condition(self):
        """Test deleting VIP condition"""
        if not self.admin_token:
            self.log_test("Delete VIP Condition", False, "No admin token available")
            return False
            
        if not hasattr(self, 'created_vip_condition_id'):
            self.log_test("Delete VIP Condition", False, "No VIP condition ID available")
            return False
            
        success, response = self.run_test(
            "Delete VIP Condition",
            "DELETE",
            f"admin/vip-conditions/{self.created_vip_condition_id}",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        return success

    def test_get_vip_prizes(self):
        """Test getting VIP prizes"""
        success, response = self.run_test(
            "Get VIP Prizes",
            "GET",
            "vip-prizes",
            200
        )
        return success

    def test_create_vip_prize(self):
        """Test creating VIP prize"""
        if not self.admin_token:
            self.log_test("Create VIP Prize", False, "No admin token available")
            return False
            
        # First get sites to use one
        sites_success, sites_response = self.run_test(
            "Get Sites for VIP Prize",
            "GET",
            "sites",
            200
        )
        
        if not sites_success or not sites_response:
            self.log_test("Create VIP Prize", False, "No sites available")
            return False
            
        site_id = sites_response[0]['id'] if sites_response else None
        if not site_id:
            self.log_test("Create VIP Prize", False, "No site ID found")
            return False
            
        vip_prize_data = {
            "name": f"VIP Prize {datetime.now().strftime('%H%M%S')}",
            "site_id": site_id,
            "description": "Exclusive VIP prize - 1000 TRX",
            "weight": 5,
            "is_vip": True
        }
        
        success, response = self.run_test(
            "Create VIP Prize",
            "POST",
            "admin/prizes",
            200,
            data=vip_prize_data,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        return success

    def test_grant_vip_spins(self):
        """Test granting VIP spins to user"""
        if not self.admin_token:
            self.log_test("Grant VIP Spins", False, "No admin token available")
            return False
            
        if not hasattr(self, 'created_vip_condition_id'):
            # Create a VIP condition first
            self.test_create_vip_condition()
            
        if not hasattr(self, 'created_vip_condition_id'):
            self.log_test("Grant VIP Spins", False, "No VIP condition available")
            return False
            
        # Get user ID from user token
        user_success, user_response = self.run_test(
            "Get User Info for VIP Grant",
            "GET",
            "auth/me",
            200,
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        
        if not user_success or 'id' not in user_response:
            self.log_test("Grant VIP Spins", False, "Could not get user ID")
            return False
            
        grant_data = {
            "user_id": user_response['id'],
            "condition_id": self.created_vip_condition_id,
            "proof": "Test proof for VIP spin grant"
        }
        
        success, response = self.run_test(
            "Grant VIP Spins",
            "POST",
            "admin/grant-vip-spins",
            200,
            data=grant_data,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        return success

    def test_vip_spin_preview(self):
        """Test VIP wheel spin preview"""
        if not self.user_token:
            self.log_test("VIP Spin Preview", False, "No user token available")
            return False
            
        success, response = self.run_test(
            "VIP Spin Preview",
            "POST",
            "wheel/vip-spin-preview",
            200,
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        
        # If user has no VIP spins, this should fail with 400
        if not success and "No VIP spins available" in str(response):
            self.log_test("VIP Spin Preview - No Spins", True, "Correctly rejected - no VIP spins")
            return True
            
        return success

    def test_get_vip_users(self):
        """Test getting VIP users"""
        if not self.admin_token:
            self.log_test("Get VIP Users", False, "No admin token available")
            return False
            
        success, response = self.run_test(
            "Get VIP Users",
            "GET",
            "admin/vip-users",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        return success

    def test_get_vip_stats(self):
        """Test getting VIP statistics"""
        if not self.admin_token:
            self.log_test("Get VIP Stats", False, "No admin token available")
            return False
            
        success, response = self.run_test(
            "Get VIP Stats",
            "GET",
            "admin/vip-stats",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        if success:
            expected_fields = ['total_vip_conditions', 'active_vip_conditions', 'users_with_vip_spins', 
                             'total_vip_grants', 'vip_prizes', 'total_vip_spins_available']
            missing_fields = [field for field in expected_fields if field not in response]
            if missing_fields:
                self.log_test("VIP Stats - Fields Check", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("VIP Stats - Fields Check", True, "All expected fields present")
                
        return success

    def test_update_user_vip_spins(self):
        """Test updating user VIP spins via admin"""
        if not self.admin_token:
            self.log_test("Update User VIP Spins", False, "No admin token available")
            return False
            
        # Get user ID
        user_success, user_response = self.run_test(
            "Get User Info for VIP Update",
            "GET",
            "auth/me",
            200,
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        
        if not user_success or 'id' not in user_response:
            self.log_test("Update User VIP Spins", False, "Could not get user ID")
            return False
            
        update_data = {
            "vip_spins": 5
        }
        
        success, response = self.run_test(
            "Update User VIP Spins",
            "PATCH",
            f"admin/users/{user_response['id']}",
            200,
            data=update_data,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        return success

    def test_database_stats_vip(self):
        """Test database stats includes VIP conditions"""
        if not self.admin_token:
            self.log_test("Database Stats VIP", False, "No admin token available")
            return False
            
        success, response = self.run_test(
            "Database Stats with VIP",
            "GET",
            "admin/database/stats",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        if success and 'vip_conditions' in response:
            self.log_test("Database Stats - VIP Conditions Field", True, f"VIP conditions count: {response['vip_conditions']}")
        elif success:
            self.log_test("Database Stats - VIP Conditions Field", False, "vip_conditions field missing from stats")
            
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