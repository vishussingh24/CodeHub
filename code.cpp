#include <bits/stdc++.h>
using namespace std;

int solve(int idx, int n, vector<int>& cost)
{
    if (idx >= n)
    {
        return 0;
    }
    int one = cost[idx] + solve(idx + 1, n, cost);
    int two = INT_MAX;
    if (idx + 2 <= n)
    {
        two = cost[idx] + solve(idx + 2, n, cost);
    }
    return min(one, two);
}

int minCostClimbingStairs(vector<int> &cost)
{
    return min(solve(0, cost.size(), cost), solve(1, cost.size(), cost));
}

int main()
{
    int n;
    cin >> n;
    vector<int> ar(n);
    for (int i = 0; i < n; i++)
        cin >> ar[i];
    int ans = minCostClimbingStairs(ar);
    cout << ans << endl;
}